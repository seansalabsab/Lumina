.PHONY: build up
start:
	@npm run dev
build:
	@docker build -t lumina .
run:
	@docker run -p 4173:4173 lumina 

