from typing import List

from pydantic import BaseModel


class SessionConfig(BaseModel):
    timer_minutes: int
    blocked_sites: List[str]


class FaceData(BaseModel):
    is_face_detected: bool
    face_size: float


class PhoneData(BaseModel):
    is_phone_detected: bool


class SiteData(BaseModel):
    is_blocked_site_detected: bool
    current_url: str


class StatusResponse(BaseModel):
    is_session_active: bool
    is_alarm_active: bool
