# @buyprintz/canvas-sdk

🚀 **Professional Canvas Editor SDK for Banners, Business Card Tins, and Tradeshow Tents**

A powerful, modular canvas editor SDK built with React and Konva.js, designed for creating professional designs for print products.

## ✨ Features

- **Multi-Product Support**: Banners, Business Card Tins, Tradeshow Tents
- **Advanced Canvas Editor**: Built with Konva.js for high performance
- **TypeScript Support**: Full type safety and IntelliSense
- **Modular Architecture**: Use only what you need

- **Professional Templates**: Pre-built templates for all product types
- **Print Specifications**: Built-in print validation and specifications
- **Pricing Integration**: Automatic pricing calculations

## 🎯 Product Types

### 🏷️ Banners
- Multiple materials (Vinyl, Mesh, Fabric)
- Various sizes and finishes
- Print specifications for outdoor/indoor use

### 🗃️ Business Card Tins
- Multi-surface design (Front, Back, Inside, Lid)
- Premium vinyl sticker printing
- Bulk quantities (100, 250, 500 units)
- Multiple finishes (Silver, Black, Gold)

### 🏕️ Tradeshow Tents
- Large format designs (10x10, 10x20 ft)
- Component management (Tent, Table Cloth, Flag)
- Professional materials and finishes

## 📦 Installation

```bash
npm install @buyprintz/canvas-sdk
```

## 🚀 Quick Start

```tsx
import React from 'react';
import { CanvasEditor, getProduct } from '@buyprintz/canvas-sdk';

function App() {
  const handleSave = (design) => {
    console.log('Design saved:', design);
  };

  const handleExport = (design) => {
    console.log('Design exported:', design);
  };

  return (
    <CanvasEditor
      productType="banner"
      canvasSize={{ width: 800, height: 400 }}
      onSave={handleSave}
      onExport={handleExport}
      showGrid={true}
      showGuides={true}
    />
  );
}
```

## 🎨 Advanced Usage

### Business Card Tins

```tsx
import { CanvasEditor, BUSINESS_CARD_TIN_PRODUCT } from '@buyprintz/canvas-sdk';

function TinEditor() {
  return (
    <CanvasEditor
      productType="tin"
      canvasSize={{ width: 350, height: 250 }}
      onSave={(design) => {
        console.log('Tin design:', design);
      }}
    />
  );
}
```

## 🛠️ API Reference

### CanvasEditor Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `productType` | `'banner' \| 'tin' \| 'tent'` | - | Product type for the editor |
| `canvasSize` | `{ width: number; height: number }` | - | Canvas dimensions |
| `backgroundColor` | `string` | `'#ffffff'` | Canvas background color |
| `onSave` | `(design: CanvasData) => void` | - | Save callback |
| `onExport` | `(design: CanvasData) => void` | - | Export callback |
| `readOnly` | `boolean` | `false` | Read-only mode |
| `showGrid` | `boolean` | `true` | Show grid overlay |

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

**Built with ❤️ by the BuyPrintz team**