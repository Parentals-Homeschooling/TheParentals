const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
};
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

export const getNewsletterSubscribers = () => read('sah_newsletter_subscribers', []);

export const subscribeToNewsletter = (email, source = 'website') => {
  const address = String(email || '').trim().toLowerCase();
  const subscribers = getNewsletterSubscribers();
  const existing = subscribers.find(item => item.email === address);
  if (existing) {
    if (existing.status !== 'active') {
      existing.status = 'active'; existing.subscribedAt = new Date().toISOString();
      write('sah_newsletter_subscribers', subscribers);
    }
    return { created: false, subscriber: existing };
  }
  const subscriber = { id: `nl_${Date.now()}`, email: address, source, status: 'active', subscribedAt: new Date().toISOString() };
  write('sah_newsletter_subscribers', [...subscribers, subscriber]);
  return { created: true, subscriber };
};

export const getPlusRequests = () => read('sah_plus_benefit_requests', []);
export const savePlusRequest = (request) => {
  const requests = getPlusRequests();
  const i = requests.findIndex(item => item.id === request.id);
  if (i >= 0) requests[i] = request; else requests.unshift(request);
  write('sah_plus_benefit_requests', requests);
  window.dispatchEvent(new Event('sah-plus-requests-updated'));
  return request;
};
export const createPlusRequest = (data) => savePlusRequest({
  id: `plus_${Date.now()}`, status: 'submitted', createdAt: new Date().toISOString(), ...data,
});

export const getNewsletterCampaigns = () => read('sah_newsletter_campaigns', []);
export const saveNewsletterCampaign = (campaign) => {
  const campaigns = getNewsletterCampaigns();
  const i = campaigns.findIndex(item => item.id === campaign.id);
  if (i >= 0) campaigns[i] = campaign; else campaigns.unshift(campaign);
  write('sah_newsletter_campaigns', campaigns);
  window.dispatchEvent(new Event('sah-promotions-updated'));
  return campaign;
};

export const getPublishedPromotions = () => getNewsletterCampaigns()
  .filter(item => item.status === 'published' && (item.type === 'social' || item.type === 'article'))
  .sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt));
