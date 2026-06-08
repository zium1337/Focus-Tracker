import time

from fastapi import FastAPI

from logic import check_alarm
from models import FaceData, PhoneData, SessionConfig, SiteData, StatusResponse
from state import system_state
from src.face_detection import start_face_detection, stop_face_detection

app = FastAPI()


@app.post("/face-data")
def update_face(data: FaceData):
    system_state["is_face_detected"] = data.is_face_detected
    system_state["face_size"] = data.face_size

    result = check_alarm()

    return {"status": result, "alarm": system_state["is_alarm_active"]}


@app.get("/")
def root():
    return {"message": "Backend działa"}


@app.post("/start-session")
def start_session(config: SessionConfig):
    system_state["is_session_active"] = True
    system_state["timer_minutes"] = config.timer_minutes
    system_state["blocked_sites"] = config.blocked_sites

    system_state["session_start_time"] = time.time()
    system_state["alarm_count"] = 0

    start_face_detection()

    return {"message": "Sesja uruchomiona"}


@app.post("/phone-data")
def update_phone(data: PhoneData):
    system_state["is_phone_detected"] = data.is_phone_detected

    result = check_alarm()

    return {"status": result, "alarm": system_state["is_alarm_active"]}


@app.post("/site-data")
def update_site(data: SiteData):
    system_state["is_blocked_site_detected"] = data.is_blocked_site_detected
    system_state["current_url"] = data.current_url

    result = check_alarm()

    return {"status": result, "alarm": system_state["is_alarm_active"]}


@app.get("/status", response_model=StatusResponse)
def get_status():
    return {
        "is_session_active": system_state["is_session_active"],
        "is_alarm_active": system_state["is_alarm_active"],
    }


@app.post("/stop-session")
def stop_session():

    if not system_state["is_session_active"]:
        return {"message": "Brak aktywnej sesji"}

    stop_face_detection()

    # oblicz czas sesji
    session_duration = time.time() - system_state["session_start_time"]

    # zapisz statystyki
    alarm_count = system_state["alarm_count"]

    # reset sesji
    system_state["is_session_active"] = False
    system_state["session_start_time"] = None
    system_state["is_alarm_active"] = False
    system_state["is_warning_started"] = False
    system_state["warning_start_time"] = None

    return {
        "message": "Sesja zakończona",
        "session_duration_seconds": int(session_duration),
        "alarm_count": alarm_count,
    }
