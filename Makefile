build:
	yarn
	yarn build
	docker build -t qbhy/piplin-views .
	rm -rf dist
