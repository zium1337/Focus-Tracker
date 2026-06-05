from typing import List

from pydantic import BaseModel


class SessionConfig(BaseModel):
    timer_minutes: int
    blocked_sites: List[str]


class FaceData(BaseModel):
    face_detected: bool
    face_size: float


class PhoneData(BaseModel):
    phone_detected: bool


class SiteData(BaseModel):
    blocked_site_detected: bool
    current_url: str


class StatusResponse(BaseModel):
    session_active: bool
    alarm_active: bool
