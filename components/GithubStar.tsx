'use client';

export default function GithubStar() {
  return (
    <>
      <a
        className="github-button"
        href="https://github.com/pablodinella/deps-matrix"
        data-icon="octicon-star"
        data-size="large"
        data-show-count="true"
        aria-label="Star pablodinella/deps-matrix on GitHub"
      >
        Star
      </a>

      <script async defer src="https://buttons.github.io/buttons.js"></script>
    </>
  );
}
