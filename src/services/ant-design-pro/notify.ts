export function notify() {
    return new EventSource(
        process.env.NODE_ENV === 'development' ? 'http://localhost:8008/api/notify' : '/api/notify',
    );
}
