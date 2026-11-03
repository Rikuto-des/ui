import { NavigationMenu } from '@urushi/react/navigation-menu';

// These examples are checked by the repository's TypeScript gate.
export const twoColumns = <NavigationMenu.Group title="Product" columns={2} />;
export const explicitActivation = <NavigationMenu label="Site" openOnHover={false}><NavigationMenu.Group title="More" submenu="inline" /></NavigationMenu>;
// @ts-expect-error Submenu layouts are explicit contract values.
export const invalidSubmenu = <NavigationMenu.Group title="More" submenu="popup" />;
// @ts-expect-error The contract permits exactly one or two columns.
export const invalidColumns = <NavigationMenu.Group title="Product" columns={3} />;
// @ts-expect-error Numeric literals must not silently become strings or unknown.
export const stringColumns = <NavigationMenu.Group title="Product" columns="2" />;
