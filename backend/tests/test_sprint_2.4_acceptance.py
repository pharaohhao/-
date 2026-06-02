"""Sprint 2.4 Acceptance Test: Persona Context Chat"""
import sys, io, asyncio, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
os.environ['ANTHROPIC_API_KEY'] = 'sk-90232d02793a40f2a0044784ff18d0aa'

from app.database import SessionLocal
from app.models import User, Persona
from app.chat.services.chat_service import ChatService

async def main():
    db = SessionLocal()
    user = db.query(User).first()  # 'alice'
    if not user:
        print("No user found. Run Sprint 1 setup first.")
        return

    svc = ChatService(db)

    # Find personas
    mama = db.query(Persona).filter(Persona.user_id == user.id, Persona.name == '妈妈').first()
    baba = db.query(Persona).filter(Persona.user_id == user.id, Persona.name == '爸爸').first()

    print("=== Sprint 2.4 Acceptance Tests ===\n")

    # Case 1: Persona 妈妈 → "她喜欢什么花？"
    if mama:
        print(f"--- Case 1: Persona=妈妈, Q='她喜欢什么花？' ---")
        r = await svc.ask(mama.id, "她喜欢什么花？")
        print(f"Reply: {r.reply}")
        print(f"Sources: {len(r.sources)}, Memories used: {r.memories_used}")
        assert "百合" in r.reply, f"Expected 百合 in reply, got: {r.reply}"
        print("PASS: 百合花 found in reply\n")

    # Case 2: Persona 爸爸 → "退休后喜欢什么？"
    if baba:
        print(f"--- Case 2: Persona=爸爸, Q='退休后喜欢什么？' ---")
        r = await svc.ask(baba.id, "退休后喜欢什么？")
        print(f"Reply: {r.reply}")
        print(f"Sources: {len(r.sources)}, Memories used: {r.memories_used}")
        assert "钓鱼" in r.reply, f"Expected 钓鱼 in reply, got: {r.reply}"
        print("PASS: 钓鱼 found in reply\n")

    # Case 3: Persona 妈妈 → "最近关注什么？"
    if mama:
        print(f"--- Case 3: Persona=妈妈, Q='最近关注什么？' ---")
        r = await svc.ask(mama.id, "最近关注什么？")
        print(f"Reply: {r.reply}")
        print(f"Sources: {len(r.sources)}, Memories used: {r.memories_used}")
        assert "空气炸锅" in r.reply, f"Expected 空气炸锅 in reply, got: {r.reply}"
        print("PASS: 空气炸锅 found in reply\n")

    # Case 4: 追问溯源 → "为什么这么认为？"
    if mama:
        print(f"--- Case 4: Persona=妈妈, Q='为什么这么认为？' ---")
        r = await svc.ask(mama.id, "为什么认为她喜欢百合花？")
        print(f"Reply: {r.reply}")
        print(f"Sources: {len(r.sources)}")
        for s in r.sources[:3]:
            print(f"  Source: {s['content']} ({s['source_type']}, {s['recorded_at'][:10]})")
        assert len(r.sources) > 0, "Expected at least 1 source"
        print("PASS: Sources provided for provenance\n")

    db.close()
    print("=== ALL 4 ACCEPTANCE TESTS PASSED ===")

asyncio.run(main())
