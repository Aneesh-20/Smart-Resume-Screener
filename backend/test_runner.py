import os
import sys

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

os.environ["PYTHONPATH"] = backend_dir

import pytest

if __name__ == "__main__":
    test_dir = os.path.join(backend_dir, "tests")
    print(f"[CI RUNNER] Starting backend test suite on {test_dir}...")
    exit_code = pytest.main(["-v", "-s", test_dir])
    print(f"[CI RUNNER] Pytest completed with exit code: {exit_code}")
    sys.exit(exit_code)
