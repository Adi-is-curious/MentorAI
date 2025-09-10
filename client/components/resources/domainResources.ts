export type ResourceItem = { title: string; url: string };

export const domainResources: Record<string, ResourceItem[]> = {
  "Data Science": [
    { title: "Kaggle Learn", url: "https://www.kaggle.com/learn" },
    { title: "W3Schools Python", url: "https://www.w3schools.com/python/" },
    {
      title: "fast.ai Practical Deep Learning",
      url: "https://course.fast.ai/",
    },
    {
      title: "Harvard CS109 Data Science",
      url: "https://cs109.github.io/2022/",
    },
    {
      title: "Google ML Crash Course",
      url: "https://developers.google.com/machine-learning/crash-course",
    },
  ],
  "Frontend Engineering": [
    { title: "MDN Web Docs", url: "https://developer.mozilla.org/en-US/" },
    { title: "React Docs", url: "https://react.dev/" },
    {
      title: "TypeScript Handbook",
      url: "https://www.typescriptlang.org/docs/",
    },
    { title: "web.dev", url: "https://web.dev/learn/" },
    { title: "W3Schools HTML", url: "https://www.w3schools.com/html/" },
    { title: "W3Schools CSS", url: "https://www.w3schools.com/css/" },
    { title: "W3Schools JavaScript", url: "https://www.w3schools.com/js/" },
  ],
  "Backend Engineering": [
    {
      title: "The Odin Project (Full Stack)",
      url: "https://www.theodinproject.com/",
    },
    { title: "Node.js Docs", url: "https://nodejs.org/en/docs" },
    { title: "PostgreSQL Docs", url: "https://www.postgresql.org/docs/" },
    { title: "W3Schools SQL", url: "https://www.w3schools.com/sql/" },
    { title: "roadmap.sh Backend", url: "https://roadmap.sh/backend" },
  ],
  "Full Stack Engineering": [
    {
      title: "FreeCodeCamp Curriculum",
      url: "https://www.freecodecamp.org/learn",
    },
    { title: "The Odin Project", url: "https://www.theodinproject.com/" },
    { title: "roadmap.sh Fullstack", url: "https://roadmap.sh/full-stack" },
  ],
  "Mobile Development": [
    { title: "Android Developers", url: "https://developer.android.com/" },
    {
      title: "Apple Developer (iOS)",
      url: "https://developer.apple.com/documentation/",
    },
    { title: "Flutter Docs", url: "https://docs.flutter.dev/" },
    {
      title: "React Native Docs",
      url: "https://reactnative.dev/docs/getting-started",
    },
  ],
  SRE: [
    {
      title: "Google SRE Book (free)",
      url: "https://sre.google/sre-book/table-of-contents/",
    },
    { title: "Prometheus Docs", url: "https://prometheus.io/docs/" },
    { title: "Grafana Learn", url: "https://grafana.com/learn/" },
  ],
  "AI/ML Engineering": [
    { title: "Hugging Face Course", url: "https://huggingface.co/learn" },
    { title: "fast.ai", url: "https://course.fast.ai/" },
    { title: "Dive into Deep Learning", url: "https://d2l.ai/" },
  ],
  "Prompt Engineering": [
    {
      title: "LangChain Docs",
      url: "https://python.langchain.com/docs/get_started/introduction/",
    },
    {
      title: "Prompt Engineering Guide",
      url: "https://www.promptingguide.ai/",
    },
    { title: "LlamaIndex Docs", url: "https://docs.llamaindex.ai/" },
  ],
  Cybersecurity: [
    { title: "OverTheWire Wargames", url: "https://overthewire.org/wargames/" },
    { title: "OWASP Top 10", url: "https://owasp.org/www-project-top-ten/" },
    { title: "TryHackMe (free rooms)", url: "https://tryhackme.com/" },
  ],
  "Cloud/DevOps": [
    { title: "AWS Skill Builder (free)", url: "https://skillbuilder.aws/" },
    { title: "Kubernetes Docs", url: "https://kubernetes.io/docs/home/" },
    { title: "roadmap.sh DevOps", url: "https://roadmap.sh/devops" },
  ],
  "UI/UX Design": [
    {
      title: "Figma Learn",
      url: "https://help.figma.com/hc/en-us/categories/360002042153-Learn-design",
    },
    { title: "Material Design", url: "https://m3.material.io/" },
    {
      title: "Nielsen Norman Group Articles",
      url: "https://www.nngroup.com/articles/",
    },
  ],
  "Product Management": [
    { title: "SVPG Articles", url: "https://www.svpg.com/articles/" },
    { title: "Atlassian Agile Guides", url: "https://www.atlassian.com/agile" },
    { title: "Mind the Product Blog", url: "https://www.mindtheproduct.com/" },
  ],
  "QA/Test": [
    { title: "Cypress Docs", url: "https://docs.cypress.io/" },
    { title: "Playwright Docs", url: "https://playwright.dev/docs/intro" },
    { title: "Selenium Docs", url: "https://www.selenium.dev/documentation/" },
  ],
  "Game Development": [
    { title: "Unity Learn", url: "https://learn.unity.com/" },
    { title: "Godot Docs", url: "https://docs.godotengine.org/" },
    {
      title: "Unreal Engine Docs",
      url: "https://dev.epicgames.com/documentation/en-us/unreal-engine",
    },
  ],
  "Embedded Systems": [
    {
      title: "Embedded Artistry Articles",
      url: "https://embeddedartistry.com/blog/",
    },
    {
      title: "FreeRTOS Docs",
      url: "https://freertos.org/Documentation/RTOS_book.html",
    },
    { title: "ARM Developer", url: "https://developer.arm.com/documentation/" },
  ],
  Blockchain: [
    { title: "Solidity Docs", url: "https://docs.soliditylang.org/" },
    {
      title: "Ethereum Dev Portal",
      url: "https://ethereum.org/en/developers/",
    },
    { title: "CryptoZombies", url: "https://cryptozombies.io/" },
  ],
  "Database Administration": [
    { title: "PostgreSQL Docs", url: "https://www.postgresql.org/docs/" },
    {
      title: "MySQL Reference",
      url: "https://dev.mysql.com/doc/refman/8.0/en/",
    },
    { title: "Percona Blog", url: "https://www.percona.com/blog/" },
  ],
  "Solutions/Systems Architecture": [
    {
      title: "System Design Primer",
      url: "https://github.com/donnemartin/system-design-primer",
    },
    {
      title: "Architectural Patterns",
      url: "https://martinfowler.com/architecture/",
    },
    {
      title: "AWS Architecture Center",
      url: "https://aws.amazon.com/architecture/",
    },
  ],
  "Technical Writing": [
    {
      title: "Google Technical Writing",
      url: "https://developers.google.com/tech-writing",
    },
    { title: "Diátaxis Docs Framework", url: "https://diataxis.fr/" },
    { title: "Write the Docs", url: "https://www.writethedocs.org/" },
  ],
};
