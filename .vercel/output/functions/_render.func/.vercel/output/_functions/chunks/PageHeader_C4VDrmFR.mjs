import { c as createComponent, a as createAstro, m as maybeRenderHead, r as renderTemplate } from './astro/server_B181Abhk.mjs';
import 'kleur/colors';
import 'clsx';

const $$Astro = createAstro();
const $$PageHeader = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$PageHeader;
  const { title, subtitle } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<header class="mb-6"> <h1 class="text-2xl font-bold">${title}</h1> ${subtitle && renderTemplate`<p class="text-gray-600 mt-2 text-sm">${subtitle}</p>`} </header>`;
}, "/Users/monikabieniecka/Downloads/Physia/src/components/common/PageHeader.astro", void 0);

export { $$PageHeader as $ };
