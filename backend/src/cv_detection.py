from threading import Thread, Event
import logging
import time
from ultralytics import YOLO

import cv2
import numpy as np

from src.logic import check_alarm
from src.state import system_state

log = logging.getLogger(__name__)

# detected face as (x, y, w, h) rectangle
type Face = np.ndarray

DEFAULT_CAMERA_INDEX = 0
FRONTAL_FACE_CASCADE = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
PROFILE_FACE_CASCADE = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_profileface.xml")
OBJECT_DETECTION_MODEL = YOLO("yolov8n.pt")
PHONE_CLASS_NAME = "cell phone"

FACE_WIDTH_INDEX = 2
FACE_HEIGHT_INDEX = 3
HORIZONTAL_FLIP_INDEX = 1

SCALE_FACTOR = 1.4
MIN_NEIGHBORS = 3

DETECTIONS_PER_SECOND = 2
SECONDS_BETWEEN_DETECTIONS = 1 / DETECTIONS_PER_SECOND

_stop_event = Event()
_thread = None


def start_cv_detection() -> None:
    global _thread
    if _thread and _thread.is_alive():
        return
    _stop_event.clear()
    _thread = Thread(target=_detection_loop, daemon=True)
    _thread.start()


def stop_cv_detection() -> None:
    _stop_event.set()
    if _thread:
        _thread.join()


def _detection_loop() -> None:
    cap = cv2.VideoCapture(1)
    if not cap.isOpened():
        log.error("Cannot open camera")
        # will later implement error handling
        return

    try:
        while not _stop_event.is_set():
            ret, frame = cap.read()
            if not ret:
                log.warning("Cannot receive frame")
                continue

            is_phone_detected = _is_phone_detected(frame)
            detected_faces = _search_for_faces(frame)

            _update_system_state(detected_faces, is_phone_detected)
            check_alarm()
            time.sleep(SECONDS_BETWEEN_DETECTIONS)
    finally:
        cap.release()


def _is_phone_detected(frame: np.ndarray) -> bool:
    results = OBJECT_DETECTION_MODEL(frame)
    detected_objects = []
    for result in results:
        new_detected_objects = [result.names[cls.item()] for cls in result.boxes.cls.int()]
        detected_objects = [*detected_objects, *new_detected_objects]

    return PHONE_CLASS_NAME in detected_objects


def _search_for_faces(frame: np.ndarray) -> list[Face]:
    gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    flipped_gray_frame = cv2.flip(gray_frame, HORIZONTAL_FLIP_INDEX)

    frontal_faces = FRONTAL_FACE_CASCADE.detectMultiScale(gray_frame, SCALE_FACTOR, MIN_NEIGHBORS)
    right_profile_faces = PROFILE_FACE_CASCADE.detectMultiScale(gray_frame, SCALE_FACTOR, MIN_NEIGHBORS)
    left_profile_faces = PROFILE_FACE_CASCADE.detectMultiScale(flipped_gray_frame, SCALE_FACTOR, MIN_NEIGHBORS)

    return [*frontal_faces, *right_profile_faces, *left_profile_faces]


def _update_system_state(detected_faces: list[Face], is_phone_detected: bool) -> None:
    is_any_face_detected = len(detected_faces) > 0

    if is_any_face_detected:
        (x, y, w, h) = _largest_face(detected_faces)
        system_state["is_face_detected"] = True
        system_state["face_height"] = int(h)
    else:
        system_state["is_face_detected"] = False
        system_state["face_height"] = 0

    system_state["is_phone_detected"] = is_phone_detected


def _largest_face(faces_list: list[Face]) -> Face:
    return max(faces_list, key=_face_area)


def _face_area(face: Face) -> int:
    return int(face[FACE_WIDTH_INDEX] * face[FACE_HEIGHT_INDEX])
