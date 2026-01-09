<script lang="ts">
  interface Props {
    error: string;
  }
  let { error }: Props = $props();
</script>

<div id="error">
  <h1>Error Loading PDF</h1>
  <pre>{error}</pre>
</div>

<style>
  #error {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 20px;
    z-index: 10;
    color: var(--vscode-errorForeground);
    background: var(--vscode-editor-background);
    font-family: var(--vscode-font-family);
    box-sizing: border-box;
  }

  pre {
    white-space: pre-wrap;
    word-break: break-all;
  }
</style>
