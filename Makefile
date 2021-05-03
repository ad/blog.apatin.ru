REGISTRY_HOST = github.com
NAME = blog.apatin.ru
REPO = ad/$(NAME)
IMG  = $(REGISTRY_HOST)/$(REPO)
TAG = latest
LOCAL_PORT = 8080

watch:
	docker run --rm -it -v $(CURDIR):/src -p $(LOCAL_PORT):8080 klakegg/hugo:0.82.0 server --disableFastRender --port $(LOCAL_PORT)

build:
	docker build . -t $(IMG):$(TAG)

run: build
	docker run --rm -p 8080:80 $(IMG):$(TAG)

.PHONY: watch build run
