"""Action Engine — 自动生成行动建议"""
from datetime import date, datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.models import Persona, PersonaMemory, Event, Action


def _ensure_aware(dt):
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


class ActionEngineService:
    def __init__(self, db: Session):
        self.db = db

    def generate_actions(self, persona_id: str) -> list[Action]:
        """为一个人物生成行动建议"""
        persona = self.db.query(Persona).filter(Persona.id == persona_id).first()
        if not persona:
            return []

        memories = self.db.query(PersonaMemory).filter(PersonaMemory.persona_id == persona_id).order_by(PersonaMemory.created_at.desc()).all()
        events = self.db.query(Event).filter(Event.persona_id == persona_id).all()
        existing_actions = self.db.query(Action).filter(Action.persona_id == persona_id, Action.is_completed == False).all()
        existing_reasons = {a.reason for a in existing_actions}

        new_actions = []

        # Rule 1: Interaction gap detection
        if memories:
            last = memories[0]
            if last.created_at:
                days = (datetime.now(timezone.utc) - _ensure_aware(last.created_at)).days
                reason = f"已{days}天未互动"
                if days > 30 and reason not in existing_reasons:
                    priority = 9 if days > 60 else 7
                    new_actions.append(Action(persona_id=persona_id, action_type="contact", suggestion=f"联系{persona.name}", reason=reason, priority=priority))

        # Rule 2: Upcoming events
        today = date.today()
        for e in events:
            if e.event_date:
                ed = e.event_date
                if e.is_recurring:
                    ed = date(today.year, ed.month, ed.day)
                days_until = (ed - today).days
                reason = f"{e.title}还有{days_until}天"
                if 0 <= days_until <= 7 and reason not in existing_reasons:
                    new_actions.append(Action(persona_id=persona_id, action_type="event_prep", suggestion=f"准备{e.title}", reason=reason, priority=10))
                elif 7 < days_until <= 30 and reason not in existing_reasons:
                    new_actions.append(Action(persona_id=persona_id, action_type="event_prep", suggestion=f"提前准备{e.title}", reason=reason, priority=6))

        # Rule 3: Recent interests → gift suggestions
        recent_hobbies = [m for m in memories[:10] if m.category == "hobby"]
        if recent_hobbies:
            hobby = recent_hobbies[0]
            reason = f"最近关注: {hobby.content[:30]}"
            if reason not in existing_reasons:
                new_actions.append(Action(persona_id=persona_id, action_type="gift", suggestion=f"基于'{hobby.content[:20]}'的礼物", reason=reason, priority=5))

        # Rule 4: Birthday upcoming
        if persona.birthdate:
            bd = persona.birthdate
            this_year_bd = date(today.year, bd.month, bd.day)
            days_until = (this_year_bd - today).days
            if 0 <= days_until <= 7:
                reason = f"生日还有{days_until}天"
                if reason not in existing_reasons:
                    new_actions.append(Action(persona_id=persona_id, action_type="event_prep", suggestion=f"准备{persona.name}的生日", reason=reason, priority=10))

        for a in new_actions:
            self.db.add(a)
        if new_actions:
            self.db.commit()

        return new_actions

    def generate_all(self, user_id: str) -> list[dict]:
        """为所有人物生成行动建议"""
        personas = self.db.query(Persona).filter(Persona.user_id == user_id).all()
        result = []
        for p in personas:
            actions = self.generate_actions(p.id)
            for a in actions:
                result.append({"persona_name": p.name, "persona_avatar": p.avatar, "action_id": a.id, "action_type": a.action_type, "suggestion": a.suggestion, "reason": a.reason, "priority": a.priority})
        return sorted(result, key=lambda x: x["priority"], reverse=True)

    def get_pending(self, persona_id: str) -> list[Action]:
        return self.db.query(Action).filter(Action.persona_id == persona_id, Action.is_completed == False).order_by(Action.priority.desc()).all()

    def complete(self, action_id: str) -> bool:
        action = self.db.query(Action).filter(Action.id == action_id).first()
        if not action:
            return False
        action.is_completed = True
        self.db.commit()
        return True

    def update_memory_confidence(self, persona_id: str):
        """更新记忆置信度——超过90天未确认的记忆降低置信度"""
        memories = self.db.query(PersonaMemory).filter(PersonaMemory.persona_id == persona_id).all()
        now = datetime.now(timezone.utc)
        for m in memories:
            if m.last_confirmed_at:
                days = (now - m.last_confirmed_at).days
                if days > 180:
                    m.confidence_score = max(0.1, m.confidence_score - 0.3)
                elif days > 90:
                    m.confidence_score = max(0.3, m.confidence_score - 0.1)
        self.db.commit()
