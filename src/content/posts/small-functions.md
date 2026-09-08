---
id: 4ac2eb7c-5a4c-478c-8103-21e60dc62bb8
title: "문제를 작은 함수로 나누어 생각하기"
date: 2026-09-06
category: 개발 기록
description: "입력과 출력을 먼저 정하고, 작은 예제로 동작을 확인하는 개발 노트."
tags: [JavaScript, 함수, 학습기록]
published: true
sample: true
---
## 먼저 입력과 출력을 적기

이 글은 코드가 포함된 학습 기록의 샘플입니다. 해결하려는 문제를 한 문장으로 적고, 어떤 입력을 받아 어떤 값을 돌려줄지 정리합니다.

예를 들어 배열 안의 숫자를 모두 더하는 함수를 생각해 봅시다.

```javascript
function sum(numbers) {
  return numbers.reduce((total, number) => total + number, 0);
}

console.log(sum([1, 2, 3])); // 6
console.log(sum([]));      // 0
```

## 경계 조건 확인하기

일반적인 예제와 함께 빈 배열 같은 경계 조건을 확인합니다. `reduce`에 초기값 `0`을 전달했으므로 빈 배열을 받아도 합계 `0`을 반환합니다.

## 학습 기록으로 남길 내용

1. 문제와 예상한 결과
2. 처음 작성한 코드
3. 발견한 오류와 원인
4. 수정한 코드와 확인한 예제
5. 다음에 더 알아볼 개념

실제로 학습한 내용으로 이 샘플을 바꾸어 사용하세요.
