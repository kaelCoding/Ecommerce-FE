export function updateMetaTag(property, content, isOg = true) {
  let element = document.querySelector(`meta[${isOg ? 'property' : 'name'}="${property}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(isOg ? 'property' : 'name', property);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

export function updateCanonicalLink() {
    let element = document.querySelector('link[rel="canonical"]');
    if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', 'canonical');
        document.head.appendChild(element);
    }
    element.setAttribute('href', window.location.href);
}