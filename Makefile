install: ## Install the dependencies needed to run the project.
	gem install bundler
	bundle install
.PHONY: install

serve: ## Serve the site locally with current and future posts.
	bundle exec jekyll serve --future --strict_front_matter --host=0.0.0.0 --livereload
.PHONY: serve
