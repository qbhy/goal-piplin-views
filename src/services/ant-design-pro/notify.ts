export function notify() {
  return new EventSource('/api/notify');
}
