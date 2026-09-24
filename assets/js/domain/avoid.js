// "Foods to avoid": a best-effort scan of TheMealDB ingredient names. It can never promise
// that a recipe is safe (stock, sauces and pastes hide things), so the UI always says
// "We check ingredient lists only". It errs on the side of flagging.

export const AVOID = {
  pork: { label: 'Pork', words: ['pork', 'bacon', 'ham', 'prosciutto', 'pancetta', 'chorizo', 'lard', 'sausage', 'sausages', 'salami', 'pepperoni', 'guanciale', 'gammon'] },
  beef: { label: 'Beef', words: ['beef', 'steak', 'mince', 'minced meat', 'veal', 'brisket', 'oxtail', 'sirloin', 'ribeye', 'bresaola'] },
  shellfish: { label: 'Shellfish', words: ['prawn', 'prawns', 'shrimp', 'shrimps', 'crab', 'lobster', 'mussels', 'clams', 'oysters', 'scallops', 'squid', 'langoustine', 'crayfish'] },
  nuts: { label: 'Nuts', words: ['nut', 'nuts', 'almond', 'almonds', 'walnut', 'walnuts', 'pecan', 'pecans', 'cashew', 'cashews', 'peanut', 'peanuts', 'hazelnut', 'hazelnuts', 'pistachio', 'pistachios', 'macadamia', 'pine nuts', 'praline', 'marzipan'] },
  dairy: {
    label: 'Dairy',
    words: ['milk', 'butter', 'cream', 'cheese', 'yogurt', 'yoghurt', 'parmesan', 'parmigiano', 'mozzarella', 'cheddar', 'ricotta', 'mascarpone', 'feta', 'ghee', 'creme fraiche', 'crème fraîche', 'buttermilk', 'gruyere', 'gruyère', 'brie', 'paneer'],
    // Look-alikes that aren't dairy.
    except: ['cream of tartar', 'coconut cream', 'coconut milk', 'almond milk', 'oat milk', 'soy milk', 'soya milk', 'peanut butter', 'cocoa butter', 'butter beans', 'vegan butter', 'vegan cheese'],
  },
  mushrooms: { label: 'Mushrooms', words: ['mushroom', 'mushrooms', 'shiitake', 'porcini', 'portobello', 'chanterelle', 'truffle'] },
};

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const patterns = Object.fromEntries(
  Object.entries(AVOID).map(([key, rule]) => [
    key,
    {
      hit: new RegExp(`(^|[^\\p{L}])(${rule.words.map(escape).join('|')})(?![\\p{L}])`, 'iu'),
      except: rule.except?.length ? new RegExp(rule.except.map(escape).join('|'), 'iu') : null,
    },
  ]),
);

/**
 * @param {Array<{name: string}>} ingredients
 * @param {string[]} avoidKeys  keys of AVOID
 * @returns {Array<{key: string, label: string, ingredient: string}>} one entry per matched rule
 */
export function avoidMatches(ingredients = [], avoidKeys = []) {
  const found = [];
  for (const key of avoidKeys) {
    const p = patterns[key];
    if (!p) continue;
    const hit = ingredients.find(({ name }) => {
      const text = name.toLowerCase();
      if (p.except && p.except.test(text)) return false;
      return p.hit.test(text);
    });
    if (hit) found.push({ key, label: AVOID[key].label, ingredient: hit.name });
  }
  return found;
}
