export function notify() {
    return new EventSource(
        process.env.NODE_ENV === 'dev' ? 'http://localhost:8008/api/notify' : '/api/notify',
    );
}
