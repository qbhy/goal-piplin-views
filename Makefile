build:
	yarn
	yarn build
	docker build -t qbhy/piplin .
	rm -rf dist
