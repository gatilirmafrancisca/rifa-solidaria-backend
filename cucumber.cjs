module.exports = {
  default: {
    import: ["./tsx-register.js", "tests/steps/**/*.steps.ts"],
    paths: ["tests/features/**/*.feature"],
    format: ["summary", "progress-bar"],
  },
};
