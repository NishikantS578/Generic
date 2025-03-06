export class ContextCollector {
  static collectWebsiteContext(): string {
    const context = {
      title: document.title,
      description: this.getMetaDescription(),
      url: window.location.href,
      mainContent: this.getMainContent(),
      navigation: this.getNavigationLinks(),
    };

    return JSON.stringify(context);
  }

  private static getMetaDescription(): string {
    const metaDescription = document.querySelector('meta[name="description"]');
    return metaDescription ? metaDescription.getAttribute("content") || "" : "";
  }

  private static getMainContent(): string {
    // Get text content from main content areas
    const mainContent = document.querySelector("main");
    const articleContent = document.querySelector("article");
    return (
      mainContent?.textContent ||
      articleContent?.textContent ||
      ""
    ).slice(0, 1000);
  }

  private static getNavigationLinks(): any[] {
    const navLinks = Array.from(document.querySelectorAll("nav a"));
    return navLinks.map((link) => ({
      text: link.textContent?.trim() || "",
      href: link.getAttribute("href") || "",
    }));
  }
}
