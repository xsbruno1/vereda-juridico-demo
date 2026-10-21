(function (root) {
  'use strict';
  const platforms = Object.freeze({
    google: { name: 'Google Ads', source: 'google', medium: 'cpc', manager: 'https://ads.google.com/', headline: 30, description: 90 },
    meta: { name: 'Meta Ads · Instagram e Facebook', source: 'meta', medium: 'paid_social', manager: 'https://adsmanager.facebook.com/', headline: 40, description: 125 },
    linkedin: { name: 'LinkedIn Ads', source: 'linkedin', medium: 'paid_social', manager: 'https://www.linkedin.com/campaignmanager/', headline: 70, description: 150 },
    microsoft: { name: 'Microsoft Advertising', source: 'bing', medium: 'cpc', manager: 'https://ads.microsoft.com/', headline: 30, description: 90 },
    tiktok: { name: 'TikTok Ads', source: 'tiktok', medium: 'paid_social', manager: 'https://ads.tiktok.com/', headline: 100, description: 100 }
  });
  const models = [
    ['advocacia', 'atlas', 'Atlas'], ['advocacia', 'prisma', 'Prisma'], ['advocacia', 'acordo', 'Acordo'],
    ['estetica', 'aurora', 'Aurora'], ['estetica', 'essentia', 'Essentia'], ['estetica', 'viva', 'Viva'],
    ['medicina', 'elo', 'Elo'], ['odontologia', 'sorriso', 'Forma'], ['medicina', 'integra', 'Íntegra'],
    ['petshop', 'companhia', 'Companhia'], ['pizzaria', 'forno', 'Forno'], ['salao', 'ritual', 'Ritual']
  ];
  const clean = (value, max = 120) => String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const slug = value => clean(value, 100).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  function safeUrl(value, local = false) {
    const url = new URL(String(value).trim());
    if (url.username || url.password || (url.protocol !== 'https:' && !(local && url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname)))) throw new Error('Use uma URL HTTPS válida, sem usuário ou senha.');
    for (const [key, val] of url.searchParams) {
      if (/^(email|e-mail|phone|telefone|cpf|nome|name|diagnosis|diagnostico|token|access_token)$/i.test(key) || /[^\s@]+@[^\s@]+\.[^\s@]+/.test(val)) throw new Error('Remova dados pessoais, diagnósticos e credenciais da URL.');
    }
    return url;
  }
  function campaign(input, local = false) {
    const platform = platforms[input.platform];
    if (!platform) throw new Error('Escolha uma plataforma.');
    const name = clean(input.name, 100), tag = slug(input.tag || name);
    if (name.length < 3 || tag.length < 3) throw new Error('Identifique a campanha com pelo menos três caracteres.');
    const daily = Number(input.daily), days = Number(input.days);
    if (!Number.isFinite(daily) || daily <= 0 || daily > 10000 || !Number.isInteger(days) || days < 1 || days > 90) throw new Error('Informe orçamento diário entre R$ 0,01 e R$ 10.000 e duração de 1 a 90 dias.');
    const url = safeUrl(input.landing, local);
    ['gclid', 'fbclid', 'msclkid', 'ttclid', 'li_fat_id', 'utm_term', 'utm_content'].forEach(key => url.searchParams.delete(key));
    url.searchParams.set('utm_source', platform.source);
    url.searchParams.set('utm_medium', platform.medium);
    url.searchParams.set('utm_campaign', tag);
    const headline = clean(input.headline, 140), description = clean(input.description, 600);
    if (!headline || !description) throw new Error('Preencha título e texto do anúncio.');
    return {
      version: 1, id: clean(input.id, 100) || root.crypto?.randomUUID?.() || 'draft-' + Date.now(),
      niche: ['advocacia', 'estetica', 'saude', 'medicina', 'odontologia', 'petshop', 'pizzaria', 'salao'].includes(input.niche) ? input.niche : 'advocacia',
      platform: input.platform, name, landing: url.href, tag, headline, description,
      daily: Math.round(daily * 100) / 100, days, plannedTotal: Math.round(daily * days * 100) / 100,
      status: input.status === 'revisao' ? 'revisao' : 'rascunho', createdAt: input.createdAt || new Date().toISOString(),
      textReviewNeeded: headline.length > platform.headline || description.length > platform.description,
      limitsNote: 'Limites indicativos para uma peça simples; conferir formato e regras no gerenciador.',
      automaticPublishing: false
    };
  }
  function csvCell(value) {
    let text = String(value ?? '');
    if (/^[\s]*[=+@-]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  }
  function read(key, fallback) { try { const value = JSON.parse(root.localStorage.getItem(key)); return value ?? fallback; } catch { return fallback; } }
  function write(key, value) { try { root.localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } }
  const api = { platforms, models, clean, esc, slug, safeUrl, campaign, csvCell, read, write };
  root.VeredaStudio = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
