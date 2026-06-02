import os
import pickle
import numpy as np
import faiss
from app.knowledge.vectorstores.base import VectorStore


class FAISSStore(VectorStore):
    """FAISS 向量存储实现，支持 metadata 过滤"""

    def __init__(self, dimension: int, index_path: str = "knowledge.index"):
        self.dimension = dimension
        self.index_path = index_path
        self.index = faiss.IndexFlatIP(dimension)  # Inner Product (cosine similarity with normalized vectors)
        self.id_to_metadata: dict[int, dict] = {}  # FAISS internal id -> metadata
        self.faiss_id_to_str_id: dict[int, str] = {}
        self._next_id = 0

    def add(self, ids: list[str], vectors: list[list[float]], metadata: list[dict]):
        if not ids:
            return
        vectors_np = np.array(vectors, dtype=np.float32)
        self.index.add(vectors_np)
        for i, (str_id, meta) in enumerate(zip(ids, metadata)):
            faiss_id = self._next_id + i
            self.faiss_id_to_str_id[faiss_id] = str_id
            self.id_to_metadata[faiss_id] = meta
        self._next_id += len(ids)

    def search(self, query_vector: list[float], top_k: int = 5, filters: dict | None = None) -> list[dict]:
        if self.count() == 0:
            return []

        query_np = np.array([query_vector], dtype=np.float32)
        # Search more to allow post-filtering
        search_k = top_k * 3 if filters else top_k
        search_k = min(search_k, self.count())
        scores, indices = self.index.search(query_np, search_k)

        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx < 0 or idx not in self.id_to_metadata:
                continue
            metadata = self.id_to_metadata[idx]
            # Apply metadata filters
            if filters:
                if not self._match_filters(metadata, filters):
                    continue
            results.append({
                "id": self.faiss_id_to_str_id.get(idx, str(idx)),
                "score": float(score),
                "metadata": metadata,
            })
            if len(results) >= top_k:
                break

        return results

    def _match_filters(self, metadata: dict, filters: dict) -> bool:
        """检查 metadata 是否匹配过滤条件"""
        for key, value in filters.items():
            if metadata.get(key) != value:
                return False
        return True

    def remove(self, ids: list[str]):
        """FAISS IndexFlatIP 不支持删除，需要重建索引。
        这里标记为需要重建，具体重建由 KnowledgeService 处理。
        """
        # Find faiss_ids to remove
        ids_to_remove = set()
        for fid, sid in self.faiss_id_to_str_id.items():
            if sid in ids:
                ids_to_remove.add(fid)
        for fid in ids_to_remove:
            self.id_to_metadata.pop(fid, None)
            self.faiss_id_to_str_id.pop(fid, None)

    def count(self) -> int:
        return self.index.ntotal

    def save(self, path: str):
        faiss.write_index(self.index, f"{path}.faiss")
        meta = {
            "id_to_metadata": self.id_to_metadata,
            "faiss_id_to_str_id": self.faiss_id_to_str_id,
            "_next_id": self._next_id,
            "dimension": self.dimension,
        }
        with open(f"{path}.meta", "wb") as f:
            pickle.dump(meta, f)

    def load(self, path: str):
        faiss_path = f"{path}.faiss"
        meta_path = f"{path}.meta"
        if os.path.exists(faiss_path) and os.path.exists(meta_path):
            self.index = faiss.read_index(faiss_path)
            with open(meta_path, "rb") as f:
                meta = pickle.load(f)
            self.id_to_metadata = meta["id_to_metadata"]
            self.faiss_id_to_str_id = meta["faiss_id_to_str_id"]
            self._next_id = meta["_next_id"]
            self.dimension = meta["dimension"]

