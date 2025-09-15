<div style="display: flex; align-items: center;">
  <img src="./public/logo.png" alt="Koubou Logo" width="60" style="margin-right: 20px;"/>
  <h2 style="margin: 0;">Koubou (工房)</h1>
</div>

<p style="padding-top: 20px">
  A BYOK (Bring Your Own Key) open-source canvas for generating, manipulating, and editing images with AI models.
</p>

<p>
  <b>Try it</b> at <a href="https://koubou.app/">koubou.app</a>
</p>

![Koubou Demo](./demo_frame.png)

> **Note:** Google requires billing enabled to use Nano Banana via API. [Learn More](https://ai.google.dev/gemini-api/docs/billing)

---

## How to Use it

- **Image Generation:** Just type any prompt in the text and submit.
- **Image Editing:** Select one or more images, then type your prompt and submit.

---

## V1 Features

###### (09/14/25)

- [x] Text-to-Image generation
- [x] Image-to-Image editing
- [x] Image upload & clipboard paste
- [x] Image download (right-click)
- [x] Infinite Canvas w/ pan & zoom
- [x] Multi-image selection
- [x] Delete selected images
- [x] Resize images via drag handles

---

## V2 Roadmap

- [ ] Support for more models/services (OpenAI, Replicate, fal.ai)
- [ ] Bring-to-Front/Back
- [ ] Prompt history
- [ ] Improve experience for mobile devices
- [ ] Add "examples" section, with pre-defined prompts
- [ ] Add tests
- [ ] TBD

---

## Stack

- **Bun**: A fast all-in-one JavaScript runtime.
- **Vite**: A next-generation frontend tooling.
- **React**: A JavaScript library for building user interfaces.
- **TypeScript**: A strongly typed superset of JavaScript.
- **Shadcn UI**: A collection of re-usable components built using Radix UI and Tailwind CSS.
- **Tailwind CSS**: A utility-first CSS framework.

---

## How to Run Locally

To get this project up and running on your local machine, follow these steps:

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/za01br/koubou.git
    cd koubou
    ```

2.  **Install dependencies:**

    ```bash
    bun install
    ```

3.  **Start the development server:**

    ```bash
    bun dev
    ```

    The application will be accessible at `http://localhost:5173` (or another port if 5173 is in use).

---

## License

Licensed under the [MIT license](https://github.com/za01br/koubou/blob/main/LICENSE).

---

## Open to Requests

If you have a feature request, bug report, or any other feedback, please open an issue.
