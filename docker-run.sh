docker run --rm --platform=linux/amd64 \
  -v "$PWD:/srv/jekyll" -w /srv/jekyll \
  -p 4000:4000 -p 35729:35729 \
  jekyll/jekyll:latest \
  sh -lc 'bundle config set path vendor/bundle && bundle install && bundle exec jekyll serve --host 0.0.0.0'
