module.exports = {
  content: ['./index.html', './case-studies/*.html'],
  darkMode: 'class',
  theme: {
    extend: {
      "colors": {
                  "background": "#F7F5EF",
                  "on-background": "#1B1B20",
                  "surface": "#F7F5EF",
                  "surface-dim": "#EFEADF",
                  "surface-bright": "#FFFFFF",
                  "surface-container-lowest": "#EFEADF",
                  "surface-container-low": "#F2EEE5",
                  "surface-container": "#FFFFFF",
                  "surface-container-high": "#FFFFFF",
                  "surface-container-highest": "#FBFAF6",
                  "surface-variant": "#ECE7DB",
                  "on-surface": "#1B1B20",
                  "on-surface-variant": "#55535C",
                  "inverse-surface": "#1B1B20",
                  "inverse-on-surface": "#F7F5EF",
                  "inverse-primary": "#BBC0E8",
                  "outline": "#8C887E",
                  "outline-variant": "#DED8CC",
                  "primary": "#3F4380",
                  "on-primary": "#FAF8F2",
                  "primary-container": "#E6E5F2",
                  "on-primary-container": "#2A2D5E",
                  "primary-fixed": "#E6E5F2",
                  "primary-fixed-dim": "#BBC0E8",
                  "on-primary-fixed": "#13163A",
                  "on-primary-fixed-variant": "#3F4380",
                  "surface-tint": "#3F4380",
                  "secondary": "#5A5866",
                  "secondary-container": "#ECEAE0",
                  "on-secondary": "#FFFFFF",
                  "on-secondary-container": "#3A3942",
                  "secondary-fixed": "#E6E4EE",
                  "secondary-fixed-dim": "#C9C7D4",
                  "on-secondary-fixed": "#191A24",
                  "on-secondary-fixed-variant": "#46454F",
                  "tertiary": "#7A6E5E",
                  "tertiary-container": "#F0E9DC",
                  "on-tertiary": "#FFFFFF",
                  "on-tertiary-container": "#564B3D",
                  "tertiary-fixed": "#F0E9DC",
                  "tertiary-fixed-dim": "#D7C9B4",
                  "on-tertiary-fixed": "#271B0C",
                  "on-tertiary-fixed-variant": "#5C5141",
                  "error": "#B3261E",
                  "on-error": "#FFFFFF",
                  "error-container": "#F9DEDC",
                  "on-error-container": "#410E0B"
      },
      "borderRadius": {
            "DEFAULT": "0.125rem",
            "lg": "0.25rem",
            "xl": "0.5rem",
            "full": "0.75rem"
      },
      "spacing": {
            "stack-md": "32px",
            "container-max": "1280px",
            "unit": "8px",
            "margin-mobile": "20px",
            "stack-lg": "80px",
            "margin-desktop": "64px",
            "gutter": "24px",
            "stack-sm": "16px"
      },
      "fontFamily": {
                  "headline-md": [
                              "Fraunces",
                              "Georgia",
                              "serif"
                  ],
                  "headline-lg": [
                              "Fraunces",
                              "Georgia",
                              "serif"
                  ],
                  "display-lg": [
                              "Fraunces",
                              "Georgia",
                              "serif"
                  ],
                  "display-lg-mobile": [
                              "Fraunces",
                              "Georgia",
                              "serif"
                  ],
                  "label-sm": [
                              "Hanken Grotesk"
                  ],
                  "body-lg": [
                              "Hanken Grotesk"
                  ],
                  "label-lg": [
                              "Hanken Grotesk"
                  ],
                  "body-md": [
                              "Hanken Grotesk"
                  ]
      },
      "fontSize": {
            "headline-md": [
                  "24px",
                  {
                        "lineHeight": "1.4",
                        "fontWeight": "600"
                  }
            ],
            "headline-lg": [
                  "32px",
                  {
                        "lineHeight": "1.3",
                        "letterSpacing": "-0.01em",
                        "fontWeight": "600"
                  }
            ],
            "display-lg": [
                  "64px",
                  {
                        "lineHeight": "1.1",
                        "letterSpacing": "-0.02em",
                        "fontWeight": "700"
                  }
            ],
            "label-sm": [
                  "12px",
                  {
                        "lineHeight": "1",
                        "letterSpacing": "0.02em",
                        "fontWeight": "500"
                  }
            ],
            "display-lg-mobile": [
                  "40px",
                  {
                        "lineHeight": "1.2",
                        "letterSpacing": "-0.02em",
                        "fontWeight": "700"
                  }
            ],
            "body-lg": [
                  "18px",
                  {
                        "lineHeight": "1.6",
                        "fontWeight": "400"
                  }
            ],
            "label-lg": [
                  "14px",
                  {
                        "lineHeight": "1",
                        "letterSpacing": "0.05em",
                        "fontWeight": "600"
                  }
            ],
            "body-md": [
                  "16px",
                  {
                        "lineHeight": "1.6",
                        "fontWeight": "400"
                  }
            ]
      }
},
  },
  plugins: [],
};
