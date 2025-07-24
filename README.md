# 🕹️ Gemini Game Lab

**Google Cloud와 Gemini 2.5 Flash를 활용한 실시간 AI 웹게임 생성기**

이 프로젝트는 사용자가 입력한 간단한 자연어 프롬프트를 기반으로, Gemini AI가 즉석에서 완전한 HTML5 웹게임을 생성하는 과정을 보여주는 인터랙티브 데모입니다. 또한, 미리 만들어진 고품질의 레트로 게임 5종을 통해 Gemini의 코드 생성 능력과 결과물을 비교 체험할 수 있습니다.

![UI Screenshot](https://storage.googleapis.com/gemini-prod/images/gemini_game_lab_ui_screenshot.png)

---

## ✨ 주요 기능 (Features)

* **🤖 실시간 AI 게임 생성**: "벽돌 깨기 게임"과 같은 간단한 프롬프트를 입력하면, Gemini가 즉시 해당 게임의 전체 코드를 생성하고 바로 플레이할 수 있도록 제공합니다.
* **🎮 고품질 내장 게임**: 사용자가 직접 GCS 버킷에 업로드한 5종의 고품질 레트로 게임을 즉시 로드하여 즐길 수 있습니다.
* **📚 동적 게임 요구서**: 내장 게임 선택 시, 해당 게임을 만들기 위한 상세한 프롬프트 예시(게임 요구서)를 확인할 수 있습니다.
* **💡 Gemini 스토리텔링**: AI가 게임을 생성하는 동안, 해당 게임의 역사나 재미있는 사실들을 실시간으로 알려주어 지루할 틈이 없습니다.
* **🌐 클라우드 기반 아키텍처**: 모든 인프라는 Google Cloud Run(백엔드)과 Cloud Storage(프론트엔드)를 통해 서버리스(Serverless)로 자동 배포 및 확장됩니다.
* **🎨 Google Material 3 디자인**: Google의 최신 디자인 시스템을 적용하여 미려하고 직관적인 UI를 제공합니다.

---

## 📂 프로젝트 구조 (Project Structure)

gemini-game-lab/
├── deploy.sh               # 전체 배포를 위한 통합 스크립트
├── README.md               # 프로젝트 설명 파일
├── .gitignore              # Git 버전 관리 제외 파일
└── src/
├── backend/            # Cloud Run에 배포될 Python 백엔드
│   ├── app.py
│   ├── Dockerfile
│   └── requirements.txt
└── frontend/           # Cloud Storage에 배포될 프론트엔드
├── index.html
└── assets/
├── main.js
└── style.css

> **참고**: 미리 만들어진 5개의 게임 파일(`game-htmls/`)과 요구서(`game-docs/`)는 이 리포지토리에 포함되어 있지 않습니다. 이 파일들은 `deploy.sh` 스크립트가 참조하는 Google Cloud Storage 버킷에 미리 업로드되어 있어야 합니다.


---

## 🚀 배포 방법 (Setup & Deployment)

Cloud Shell 또는 Google Cloud SDK가 설치된 환경에서 아래의 단계를 따르세요.

1.  **리포지토리 클론**:
    ```bash
    git clone [https://github.com/ldu1225/gemini-game-lab.git](https://github.com/ldu1225/gemini-game-lab.git)
    cd gemini-game-lab
    ```

2.  **프로젝트 ID 설정**: `gcloud`가 올바른 GCP 프로젝트를 가리키고 있는지 확인합니다.
    ```bash
    gcloud config set project [YOUR_GCP_PROJECT_ID]
    ```

3.  **배포 스크립트 실행 권한 부여**:
    ```bash
    chmod +x deploy.sh
    ```

4.  **스크립트 실행**: 스크립트를 실행하면 백엔드와 프론트엔드 배포가 자동으로 진행됩니다. 약 5분 정도 소요될 수 있습니다.
    ```bash
    ./deploy.sh
    ```

5.  **URL 접속**: 스크립트 실행이 완료되면 출력되는 최종 URL에 접속하여 데모를 확인합니다.

