npm update \
  && tsc \
  && npm publish --otp=$1 \
  && git add . \
  && git commit -m "Publish" \
  && git push origin HEAD
