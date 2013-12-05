MOCHA?=node_modules/.bin/mocha
REPORTER?=spec
GROWL?=--growl
FLAGS=$(GROWL) --reporter $(REPORTER) --colors

test:
	$(MOCHA) $(shell find test -name "*-test.js") $(FLAGS)

one:
	$(MOCHA) $(NAME) $(FLAGS)

unit:
	$(MOCHA) $(shell find test/unit -name "*-test.js") $(FLAGS)

http:
	$(MOCHA) $(shell find test/http -name "*-test.js") $(FLAGS)

protobuf:
	$(MOCHA) $(shell find test/protobuf -name "*-test.js") $(FLAGS)

.PHONY: test
.PHONY: http
.PHONY: protobuf

