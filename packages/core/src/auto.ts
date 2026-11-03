// Side-effect entry for pages without React: <script type="module" src="@urushi/core/auto">.
import { installRuntime } from "./runtime.ts";

if (typeof document !== "undefined") installRuntime();
