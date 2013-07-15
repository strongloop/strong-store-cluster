# Makefile

-include local.mk

.PHONY: test default

default: test

test:
	@npm test

jenkins-build: jenkins-install jenkins-test

jenkins-install:
	npm install

jenkins-test:
	./node_modules/.bin/mocha --timeout 5000 --slow 1000 --ui tdd --reporter xunit > xunit.xml

