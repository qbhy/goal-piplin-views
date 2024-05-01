export function notify() {
    return new EventSource('http://localhost:8008/api/notify');
}
