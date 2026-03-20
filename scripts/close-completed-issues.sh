#!/bin/bash

# 关闭已完成的 Issues

REPO="flying-ape-code/chileme"
TOKEN="$GITHUB_TOKEN"

# 已完成的 Issue 列表
COMPLETED_ISSUES="3 5 6 8"

for issue in $COMPLETED_ISSUES; do
  echo "🔒 关闭 Issue #$issue..."
  curl -s -X PATCH \
    -H "Authorization: token $TOKEN" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/$REPO/issues/$issue" \
    -d '{"state":"closed"}' > /dev/null
  echo "✅ Issue #$issue 已关闭"
done

echo "✅ 所有已完成的 Issue 已关闭"
