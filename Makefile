REGISTRY_HOST = registry.git.nethouse.ru
NAME = hugo-test
REPO = ad/$(NAME)
IMG  = $(REGISTRY_HOST)/$(REPO)
TAG = latest
LOCAL_PORT = 8080

watch:
	docker run --rm -it -v $(CURDIR):/src -p $(LOCAL_PORT):8080 klakegg/hugo:0.80.0 server --port $(LOCAL_PORT)

build:
	docker build . -t $(IMG):$(TAG)

run: build
	docker run --rm -p 8080:80 $(IMG):$(TAG)

.PHONY: watch build run
