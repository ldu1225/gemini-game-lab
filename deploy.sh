#!/bin/bash
# ==============================================================================
# [최종 통합 배포 스크립트] src 폴더를 기준으로 전체 프로젝트를 배포합니다.
# ==============================================================================
echo " "
echo "🚀 전체 프로젝트 배포를 시작합니다."
echo " "

# --- 1. 환경 설정 ---
export PROJECT_ID=$(gcloud config get-value project | tr -d '\n\r' | awk '{print $1}')
export REGION="us-central1"
export ARTIFACT_REPO_NAME="lg-demo-game-creator-repo"
export FRONTEND_BUCKET_NAME="duleetest-gemini-canvas-ui"
export BACKEND_SERVICE_NAME="gemini-creator-backend"

echo "➡️ 필요한 Google Cloud API를 활성화합니다..."
gcloud services enable cloudbuild.googleapis.com artifactregistry.googleapis.com run.googleapis.com storage.googleapis.com iam.googleapis.com --project=${PROJECT_ID} --quiet

# --- 2. 백엔드 배포 및 URL 확보 ---
echo "➡️ 백엔드 배포를 시작합니다 (./src/backend 기준)..."

gcloud artifacts repositories create ${ARTIFACT_REPO_NAME} --repository-format=docker --location=${REGION} --project=${PROJECT_ID} --quiet || echo "INFO: Artifact repository already exists."
gcloud builds submit ./src/backend --tag ${REGION}-docker.pkg.dev/${PROJECT_ID}/${ARTIFACT_REPO_NAME}/${BACKEND_SERVICE_NAME}:latest --project=${PROJECT_ID} --quiet

SERVICE_URL_RAW=$(gcloud run deploy ${BACKEND_SERVICE_NAME} \
    --image=${REGION}-docker.pkg.dev/${PROJECT_ID}/${ARTIFACT_REPO_NAME}/${BACKEND_SERVICE_NAME}:latest \
    --platform=managed --region=${REGION} --allow-unauthenticated \
    --project=${PROJECT_ID} --memory=1Gi --cpu=1 --timeout=360s \
    --set-env-vars="PROJECT_ID=${PROJECT_ID},LOCATION=${REGION}" \
    --format='value(status.url)' --quiet)

export SERVICE_URL=$(echo "$SERVICE_URL_RAW" | tr -d '\n\r' | awk '{print $1}')
if [ -z "$SERVICE_URL" ]; then
    echo "❌ 치명적 오류: 백엔드 서비스 URL을 가져오는 데 실패했습니다."
    exit 1
fi
echo "✅ 백엔드 배포 성공! URL: ${SERVICE_URL}"

# --- 3. 프론트엔드 파일에 URL 주입 및 배포 ---
echo "➡️ 프론트엔드 파일을 GCS 버킷에 업로드합니다 (기존 게임 파일은 유지)..."

# 임시로 index.html 파일을 수정하여 URL을 주입합니다.
cp ./src/frontend/index.html ./index.html.tmp

# macOS와 GNU/Linux sed 호환성을 위해 .bak 확장자 사용
sed -i.bak "s|BACKEND_URL: \"\${SERVICE_URL}\"|BACKEND_URL: \"${SERVICE_URL}\"|g" ./index.html.tmp
sed -i.bak "s|BUCKET_NAME: \"\${FRONTEND_BUCKET_NAME}\"|BUCKET_NAME: \"${FRONTEND_BUCKET_NAME}\"|g" ./index.html.tmp
rm ./index.html.tmp.bak

gcloud storage cp ./index.html.tmp gs://${FRONTEND_BUCKET_NAME}/index.html --quiet
gcloud storage cp ./src/frontend/assets/main.js gs://${FRONTEND_BUCKET_NAME}/assets/main.js --quiet
gcloud storage cp ./src/frontend/assets/style.css gs://${FRONTEND_BUCKET_NAME}/assets/style.css --quiet

if [ $? -ne 0 ]; then
    echo "❌ 치명적 오류: 프론트엔드 파일 업로드에 실패했습니다."
    exit 1
fi
rm ./index.html.tmp

gcloud storage buckets update gs://${FRONTEND_BUCKET_NAME} --web-main-page-suffix=index.html --quiet
gcloud storage objects update gs://${FRONTEND_BUCKET_NAME}/index.html --cache-control="no-cache,max-age=0,must-revalidate" --quiet
gcloud storage objects update gs://${FRONTEND_BUCKET_NAME}/assets/** --cache-control="no-cache,max-age=0,must-revalidate" --quiet

# --- 최종 결과 출력 ---
CACHE_BUSTER=$(date +%s)
FINAL_URL="https://storage.googleapis.com/${FRONTEND_BUCKET_NAME}/index.html?v=${CACHE_BUSTER}"

echo " "
echo "========================================================================"
echo "🎉🎉🎉 모든 배포가 성공적으로 완료되었습니다! 🎉🎉🎉"
echo ""
echo "지금 바로 아래의 URL에 접속하여 데모를 확인해보세요."
echo "(캐시 문제를 방지하기 위해 주소 끝에 임의의 숫자가 추가되었습니다.)"
echo "------------------------------------------------------------------------"
echo ""
echo "  ${FINAL_URL}"
echo ""
echo "------------------------------------------------------------------------"
echo "💡 만약 그래도 이전 화면이 보인다면, 시크릿 모드에서 접속해보세요."
echo "========================================================================"
echo " "
