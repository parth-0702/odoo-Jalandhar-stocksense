# Red reference UI refresh

The September 26 red StockSense reference is implemented through `client/src/reference-theme.css`, loaded after the existing base stylesheet. Inventory services and existing business-rule fields are preserved.

- Scarlet primary actions, logo, active navigation, links, and document references.
- Compact sidebar and top bar with warehouse selection; working Categories, Reordering Rules, and Reports routes.
- Compact dashboard KPIs, seven-day stock movement chart, category donut, and Recent Activities panel. Charts use API/catalog data and show an empty state where there are no validated movements.
- White forms, dense tables, soft blue-gray surfaces, and green/blue/amber/red status badges.
- Warehouse-photo login/signup panel and centered envelope-themed password reset screen.
- Responsive navigation drawer and compact mobile layout.

## Generated asset

File: `client/public/warehouse-login.png`.

Created with the built-in image-generation tool. Final prompt:

> Use case: photorealistic-natural. Asset type: warehouse photo background for the right half of an inventory software login page. Create a realistic bright clean warehouse aisle with tall gray metal shelving and warm orange horizontal shelf beams, neatly stacked tan cardboard cartons and wooden pallets, natural soft daylight, pale concrete floor. Portrait composition, perspective looking down the aisle, shelves prominent on the right, quieter brighter negative space toward the left for a text overlay added later in code. Warm beige, pale gray and restrained orange palette, photographic texture. No people, no logos, no text, no UI. Elegant softly lit commercial warehouse photography, not an illustration.

Text, overlays, icons, and charts are rendered in code. The asset is stored in the project and does not depend on an external image URL.
