// Side-effect entry for pages without React: <script type="module" src="@yourlib/core/auto">.
import { installRuntime } from "./runtime.ts";

if (typeof document !== "undefined") installRuntime();
