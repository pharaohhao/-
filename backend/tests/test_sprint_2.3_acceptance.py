"""Sprint 2.3 Acceptance Test: Hybrid Search"""
import sys, io, asyncio, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from app.database import SessionLocal
from app.models import User, Persona, PersonaMemory
from app.knowledge.services.knowledge_service import KnowledgeService
from app.ai.services.memory_intelligence_service import MemoryIntelligenceService


async def main():
    db = SessionLocal()
    user = db.query(User).first()

    # Step 1: Make sure we have personas and memories
    for name, relation in [('妈妈', 'mother'), ('爸爸', 'father')]:
        p = db.query(Persona).filter(Persona.user_id == user.id, Persona.name == name).first()
        if not p:
            p = Persona(user_id=user.id, name=name, relation=relation)
            db.add(p)
            db.commit()

    # Step 2: Add memories if needed
    if db.query(PersonaMemory).count() < 4:
        svc = MemoryIntelligenceService(db)
        await svc.process(user.id, "妈妈喜欢百合花，最近一直在看空气炸锅。爸爸退休以后开始迷上钓鱼，想换一根鱼竿。")

    # Step 3: Rebuild index for clean state
    ks = KnowledgeService(db)
    ks.rebuild_index()
    print(f"Index built with {ks.vector_store.count()} vectors")

    # Step 4: ACCEPTANCE TESTS
    print("\n=== ACCEPTANCE TESTS ===")

    # Test 1: "喜欢什么花"
    r = ks.search("喜欢什么花", top_k=3)
    print(f"\nTest 1: '喜欢什么花'")
    for item in r.results:
        print(f"  [{item.score_type}] score={item.score} | {item.persona_name}: {item.content}")
    top = r.results[0] if r.results else None
    assert top and "百合" in top.content, f"Expected 百合花, got {top.content if top else 'nothing'}"
    print("  PASS: 百合花 is top result")

    # Test 2: "退休后的兴趣"
    r = ks.search("退休后的兴趣", top_k=3)
    print(f"\nTest 2: '退休后的兴趣'")
    for item in r.results:
        print(f"  [{item.score_type}] score={item.score} | {item.persona_name}: {item.content}")
    found_fishing = any("钓鱼" in item.content for item in r.results)
    assert found_fishing, "爸爸钓鱼 not in results"
    print("  PASS: 爸爸钓鱼 in top 3")

    # Test 3: "最近想买什么"
    r = ks.search("最近想买什么", top_k=5)
    print(f"\nTest 3: '最近想买什么'")
    for item in r.results:
        print(f"  [{item.score_type}] score={item.score} | {item.persona_name}: {item.content}")
    found = any("空气炸锅" in item.content or "鱼竿" in item.content for item in r.results)
    assert found, "Neither 空气炸锅 nor 鱼竿 found"
    print("  PASS: 空气炸锅 or 鱼竿 found")

    # Test 4: Filtered search (only 妈妈)
    mama = db.query(Persona).filter(Persona.user_id == user.id, Persona.name == '妈妈').first()
    r = ks.search("最近关注什么", persona_id=mama.id, top_k=3)
    print(f"\nTest 4: '最近关注什么' (filtered to 妈妈)")
    for item in r.results:
        print(f"  [{item.score_type}] score={item.score} | {item.persona_name}: {item.content}")
    all_mama = all(item.persona_id == mama.id for item in r.results)
    assert all_mama, "Non-妈妈 results in filtered search!"
    print("  PASS: All results belong to 妈妈")

    print("\n=== ALL ACCEPTANCE TESTS PASSED ===")
    db.close()


if __name__ == "__main__":
    asyncio.run(main())
