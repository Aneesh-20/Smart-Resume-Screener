import '@testing-library/jest-dom';

// Mock WebGL context in JSDOM environment
HTMLCanvasElement.prototype.getContext = function (contextType: string) {
  if (contextType === 'webgl' || contextType === 'experimental-webgl' || contextType === 'webgl2') {
    return {
      getExtension: () => null,
      getParameter: () => 0,
      createTexture: () => ({}),
      bindTexture: () => {},
      texParameteri: () => {},
      texImage2D: () => {},
      clearColor: () => {},
      clearDepth: () => {},
      clear: () => {},
      enable: () => {},
      disable: () => {},
      depthFunc: () => {},
      viewport: () => {},
      drawArrays: () => {},
      drawElements: () => {},
      createBuffer: () => ({}),
      bindBuffer: () => {},
      bufferData: () => {},
      createProgram: () => ({}),
      createShader: () => ({}),
      shaderSource: () => {},
      compileShader: () => {},
      attachShader: () => {},
      linkProgram: () => {},
      useProgram: () => {},
      getShaderParameter: () => true,
      getProgramParameter: () => true,
      getShaderInfoLog: () => '',
      getProgramInfoLog: () => '',
      getAttribLocation: () => 0,
      getUniformLocation: () => ({}),
      enableVertexAttribArray: () => {},
      vertexAttribPointer: () => {},
      uniformMatrix4fv: () => {},
      uniform1f: () => {},
      uniform1i: () => {},
      uniform2f: () => {},
      uniform3f: () => {},
      uniform4f: () => {},
    } as any;
  }
  return null;
} as any;
