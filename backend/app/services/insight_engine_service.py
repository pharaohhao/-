"""Life Insight Engine -- 数据驱动的洞察分析"""
from datetime import date, datetime, timezone, timedelta
from collections import Counter, defaultdict
from sqlalchemy.orm import Session
from app.models import Persona, PersonaMemory, Event, Observation, PersonaInsight


class InsightEngineService:
    """基于历史数据生成人物洞察"""

    def __init__(self, db: Session):
        self.db = db

    def analyze(self, persona_id: str) -> dict:
        """完整分析一个人物，返回所有洞察"""
        persona = self.db.query(Persona).filter(Persona.id == persona_id).first()
        if not persona:
            return {"error": "Persona not found"}

        # Get all data
        memories = (
            self.db.query(PersonaMemory)
            .filter(PersonaMemory.persona_id == persona_id)
            .order_by(PersonaMemory.created_at.asc())
            .all()
        )
        events = (
            self.db.query(Event)
            .filter(Event.persona_id == persona_id)
            .all()
        )
        observations = (
            self.db.query(Observation)
            .filter(Observation.persona_id == persona_id)
            .all()
        )

        # Compute insights
        interest_trends = self._analyze_interest_trends(memories)
        health = self._calculate_health(persona, memories, events)
        gaps = self._detect_gaps(persona, memories)
        recommendations = self._generate_recommendations(
            persona, memories, events, observations
        )

        # Store in persona_insights
        insight = (
            self.db.query(PersonaInsight)
            .filter(PersonaInsight.persona_id == persona_id)
            .first()
        )
        if not insight:
            insight = PersonaInsight(persona_id=persona_id)
            self.db.add(insight)

        insight.interest_trends = interest_trends
        insight.health_score = health["score"]
        insight.health_factors = health["factors"]
        insight.emotion_trend = {"gaps": gaps}
        insight.gift_suggestions = recommendations.get("gifts", "")
        self.db.commit()

        return {
            "persona_id": persona_id,
            "persona_name": persona.name,
            "interest_trends": interest_trends,
            "health_score": health,
            "interaction_gaps": gaps,
            "recommendations": recommendations,
        }

    def analyze_all(self, user_id: str) -> list[dict]:
        """分析用户的所有人物"""
        personas = (
            self.db.query(Persona)
            .filter(Persona.user_id == user_id)
            .all()
        )
        results = []
        for p in personas:
            results.append(self.analyze(p.id))
        return results

    def get_dashboard(self, user_id: str) -> dict:
        """获取用户的洞察总览"""
        personas = (
            self.db.query(Persona)
            .filter(Persona.user_id == user_id)
            .all()
        )
        items = []
        for p in personas:
            insight = (
                self.db.query(PersonaInsight)
                .filter(PersonaInsight.persona_id == p.id)
                .first()
            )
            memories = (
                self.db.query(PersonaMemory)
                .filter(PersonaMemory.persona_id == p.id)
                .all()
            )
            last_memory = memories[-1] if memories else None
            days_since = None
            if last_memory and last_memory.created_at:
                days_since = (datetime.now(timezone.utc) - last_memory.created_at).days

            items.append(
                {
                    "persona_id": p.id,
                    "persona_name": p.name,
                    "persona_avatar": p.avatar,
                    "persona_relation": p.relation,
                    "health_score": insight.health_score if insight else 100,
                    "memory_count": len(memories),
                    "days_since_last_interaction": days_since,
                    "interest_trends": insight.interest_trends if insight else None,
                    "gift_suggestions": insight.gift_suggestions if insight else "",
                }
            )

        # Sort by health_score ascending (worst first -- needs attention)
        items.sort(key=lambda x: x["health_score"])
        return {
            "personas": items,
            "generated_at": datetime.now(timezone.utc).isoformat(),
        }

    def _analyze_interest_trends(
        self, memories: list[PersonaMemory]
    ) -> dict:
        """分析兴趣趋势变化"""
        if not memories:
            return {"trends": [], "summary": "No data"}

        # Group by year-quarter
        by_period = defaultdict(lambda: defaultdict(int))
        for m in memories:
            if m.created_at:
                period = (
                    f"{m.created_at.year}-Q"
                    f"{(m.created_at.month - 1) // 3 + 1}"
                )
                by_period[period][m.category] += 1

        # Calculate trends
        periods = sorted(by_period.keys())
        trends = []
        if len(periods) >= 2:
            current = by_period[periods[-1]]
            previous = by_period[periods[-2]]
            all_cats = set(current.keys()) | set(previous.keys())
            for cat in all_cats:
                curr = current.get(cat, 0)
                prev = previous.get(cat, 0)
                if prev > 0:
                    change = ((curr - prev) / prev) * 100
                else:
                    change = 100 if curr > 0 else 0
                trends.append(
                    {
                        "category": cat,
                        "current": curr,
                        "previous": prev,
                        "change_pct": round(change, 1),
                    }
                )

        trends.sort(key=lambda x: x["change_pct"], reverse=True)

        # Category labels
        labels = {
            "food": "饮食",
            "hobby": "兴趣",
            "style": "审美",
            "personality": "性格",
            "relationship": "关系",
            "dream": "愿望",
            "dislike": "禁忌",
            "other": "其他",
        }

        return {
            "periods": periods,
            "trends": [
                {
                    "category": t["category"],
                    "label": labels.get(t["category"], t["category"]),
                    "change_pct": t["change_pct"],
                    "current": t["current"],
                    "previous": t["previous"],
                }
                for t in trends
            ],
        }

    def _calculate_health(
        self,
        persona: Persona,
        memories: list[PersonaMemory],
        events: list[Event],
    ) -> dict:
        """计算关系健康度 0-100"""
        factors = {}
        score = 100

        # Factor 1: Recency (0-30 points)
        if memories:
            last = memories[-1]
            if last.created_at:
                days = (datetime.now(timezone.utc) - last.created_at).days
                if days <= 7:
                    factors["recency"] = {
                        "score": 30,
                        "detail": f"最近 {days} 天内有互动",
                    }
                elif days <= 30:
                    factors["recency"] = {
                        "score": 20,
                        "detail": f"最近 {days} 天内有互动",
                    }
                elif days <= 90:
                    factors["recency"] = {
                        "score": 10,
                        "detail": f"最近互动在 {days} 天前",
                    }
                else:
                    factors["recency"] = {
                        "score": 0,
                        "detail": f"已 {days} 天无互动",
                    }
                    score -= 30
            else:
                factors["recency"] = {"score": 15, "detail": "时间未知"}
        else:
            factors["recency"] = {"score": 0, "detail": "无互动记录"}
            score -= 30

        # Factor 2: Frequency (0-30 points)
        if len(memories) >= 20:
            factors["frequency"] = {"score": 30, "detail": f"共 {len(memories)} 条记忆"}
        elif len(memories) >= 10:
            factors["frequency"] = {"score": 20, "detail": f"共 {len(memories)} 条记忆"}
        elif len(memories) >= 3:
            factors["frequency"] = {"score": 10, "detail": f"共 {len(memories)} 条记忆"}
        else:
            factors["frequency"] = {
                "score": 3,
                "detail": f"仅 {len(memories)} 条记忆",
            }
            score -= 10

        # Factor 3: Event engagement (0-20 points)
        if len(events) >= 5:
            factors["events"] = {"score": 20, "detail": f"记录了 {len(events)} 个事件"}
        elif len(events) >= 1:
            factors["events"] = {"score": 10, "detail": f"记录了 {len(events)} 个事件"}
        else:
            factors["events"] = {"score": 0, "detail": "无事件记录"}

        # Factor 4: Completeness (0-20 points)
        completeness_score = 0
        details = []
        if persona.birthdate:
            completeness_score += 10
            details.append("生日已记录")
        else:
            details.append("生日未记录")
        if persona.description:
            completeness_score += 5
            details.append("有描述")
        if persona.interests:
            completeness_score += 5
            details.append("有兴趣标签")
        factors["completeness"] = {
            "score": completeness_score,
            "detail": ", ".join(details),
        }

        total_factor_scores = sum(f["score"] for f in factors.values())
        # recency(30) + frequency(30) + events(20) + completeness(20) = 100

        return {
            "score": min(100, max(0, total_factor_scores)),
            "factors": factors,
        }

    def _detect_gaps(
        self, persona: Persona, memories: list[PersonaMemory]
    ) -> list[dict]:
        """检测联系缺失"""
        gaps = []
        if memories:
            last = memories[-1]
            if last.created_at:
                days = (datetime.now(timezone.utc) - last.created_at).days
                if days > 30:
                    gaps.append(
                        {
                            "type": "long_gap",
                            "persona_name": persona.name,
                            "days": days,
                            "severity": "high" if days > 60 else "medium",
                            "suggestion": f"已 {days} 天未与{persona.name}互动，建议近期联系",
                        }
                    )
        if not gaps:
            gaps.append(
                {
                    "type": "healthy",
                    "persona_name": persona.name,
                    "detail": "互动频率正常",
                }
            )
        return gaps

    def _generate_recommendations(
        self,
        persona: Persona,
        memories: list[PersonaMemory],
        events: list[Event],
        observations: list[Observation],
    ) -> dict:
        """生成推荐建议"""
        gifts = []
        # Upcoming events
        today = date.today()
        for e in events:
            if e.event_date:
                event_date = e.event_date
                # Check if upcoming (within 30 days, accounting for recurring)
                if e.is_recurring:
                    this_year = date(today.year, event_date.month, event_date.day)
                    days_until = (this_year - today).days
                    if 0 <= days_until <= 30:
                        gifts.append(f"{e.title}临近，考虑准备礼物")

        # Analyze memory categories for gift ideas
        hobby_memories = [m for m in memories if m.category == "hobby"]
        if hobby_memories:
            recent = hobby_memories[-3:]
            for m in recent:
                gifts.append(f"基于兴趣'{m.content}'的礼物")

        # Observations
        if observations:
            recent_obs = [
                o
                for o in observations[-3:]
                if hasattr(o, "confidence") and o.confidence and o.confidence > 0.6
            ]
            for o in recent_obs:
                gifts.append(f"关注: {o.content[:30]}")

        return {
            "gifts": ", ".join(gifts[:5]) if gifts else "暂无推荐",
            "events": [
                {
                    "title": e.title,
                    "date": e.event_date.isoformat() if e.event_date else None,
                }
                for e in events
                if e.event_date and (e.event_date - today).days >= 0
            ]
            if events
            else [],
        }
