import time

from state import system_state

FACE_SIZE_THRESHOLD = 50
WARNING_TIME = 10  # ile sekund czekamy przed alarmem, mozna zmienic


def check_alarm():
    """
    Sprawdza czy alarm powinien się uruchomic
    """

    # jeśli sesja nie jest aktywna
    if not system_state["session_active"]:
        system_state["alarm_active"] = False
        system_state["warning_started"] = False
        system_state["warning_start_time"] = None
        return "Sesja nieaktywna"

    # sprawdza czy jest problem
    problem = None

    if not system_state["face_detected"]:
        problem = "Brak twarzy"

    elif system_state["face_size"] < FACE_SIZE_THRESHOLD:
        problem = "Za daleko od biurka"

    elif system_state["phone_detected"]:
        problem = "Telefon wykryty"

    elif system_state["blocked_site_detected"]:
        problem = "Zakazana strona"

    # jesli jest problem
    if problem:

        # pierwszy moment wykrycia problemu
        if not system_state["warning_started"]:
            system_state["warning_started"] = True
            system_state["warning_start_time"] = time.time()
            system_state["alarm_active"] = False
            return f"Ostrzeżenie: {problem}"

        # sprawdza ile czasu minelo
        elapsed = time.time() - system_state["warning_start_time"]

        if elapsed >= WARNING_TIME:

            # policz alarm tylko jesli wcześniej nie byl aktywny
            if not system_state["alarm_active"]:
                system_state["alarm_count"] += 1

            system_state["alarm_active"] = True
            return problem

        system_state["alarm_active"] = False
        return f"Oczekiwanie... {int(elapsed)}s"

    # jesli problem zniknal
    system_state["warning_started"] = False
    system_state["warning_start_time"] = None
    system_state["alarm_active"] = False

    return "OK"
