
import { GoogleGenAI, Type } from "@google/genai";
import { BantData, BantEvaluation, BantWeights } from "../types";

export const evaluateOpportunity = async (data: BantData, weights: BantWeights): Promise<BantEvaluation> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    다음 B2B 영업 기회를 평가하고 리포트를 생성해주세요.
    기준일: 2026년 1월 1일

    [기본 정보]
    - 프로젝트명: ${data.projectName}
    - 고객사: ${data.customerName}
    - 예상 규모: ${data.dealSize}

    [평가 기준 및 사용자 지정 배점]
    사용자가 지정한 항목별 최대 점수는 다음과 같습니다 (총합 100점):
    1. 예산 (Budget): [최대 ${weights.budget}점] 구체적인 예산 책정 여부
    2. 권한 (Authority): [최대 ${weights.authority}점] 의사결정권자(Key Man) 영업라인 확보 여부
    3. 니즈 (Needs): [최대 ${weights.need}점] 명확한 페인 포인트(Pain Point) 존재 여부
    4. 시기 (Timeline): [최대 ${weights.timeline}점] 2026년 상반기(6개월 이내) 도입 구체성
    5. 경쟁 (Competition): [최대 ${weights.competition}점] 실질 수주 가능성 (들러리 여부)

    [항목별 상세 현황]
    - 예산 현황: ${data.budget}
    - 권한 현황: ${data.authority}
    - 니즈 현황: ${data.need}
    - 일정 현황: ${data.timeline}
    - 경쟁 현황: ${data.competition}
    
    [최종 합계점수 별 판정 기준 - 반드시 준수할 것]
    1. 80점 이상: verdict를 'GO'로 설정하고, [적극 지원] 판정. (수주 가능성이 매우 높음)
    2. 60점 이상 80점 미만: verdict를 'NURTURE'로 설정하고, [제한적 지원] 판정. (온라인 미팅 또는 표준 데모 시연 1회로 제한)
    3. 60점 미만: verdict를 'NO-GO'로 설정하고, [지원 불가] 판정. (자료만 제공하며 추후 기회 모니터링)

    [최종 판정 생성 규칙]
    1. summaryEvaluation: "[종합 평가 및 제안]" 이라는 제목을 포함하십시오. 현재 날짜(2026-01-01) 기준의 시급성을 반영하십시오.
    2. detailedScores 내 각 항목:
       - score: 지정된 최대 점수 범위 내에서 객관적으로 산출하십시오.
       - reasoning: 해당 점수를 산정한 구체적인 근거를 작성하십시오.
       - analysis: 해당 항목에 대한 심층 분석 내용을 작성하십시오.
    3. futureActions: "[향후 권장 조치]" 하위에 들어갈 구체적인 실행 아이템들을 리스트로 생성하십시오.
    4. milestoneTip: 점수 개선을 위한 핵심 포인트를 조건부 문구로 작성하십시오.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: "당신은 전문 B2B 세일즈 전략가입니다. 기준일 2026년 1월 1일을 바탕으로 영업 기회를 냉정하게 평가하십시오. 요청된 점수대별 판정 기준과 사용자 지정 배점을 엄격하게 적용하여 'GO', 'NURTURE', 'NO-GO'를 구분하십시오. 각 항목별로 산정 근거와 분석 내용을 상세히 작성해야 합니다. 모든 답변은 한국어로 작성하십시오.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.NUMBER },
          verdict: { type: Type.STRING },
          detailedScores: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                item: { type: Type.STRING },
                criteria: { type: Type.STRING },
                inputSummary: { type: Type.STRING },
                score: { type: Type.NUMBER },
                progress: { type: Type.STRING },
                reasoning: { type: Type.STRING },
                analysis: { type: Type.STRING }
              },
              required: ["item", "criteria", "inputSummary", "score", "progress", "reasoning", "analysis"]
            }
          },
          summaryEvaluation: { type: Type.STRING },
          futureActions: { type: Type.ARRAY, items: { type: Type.STRING } },
          milestoneTip: { type: Type.STRING },
          strategy: { type: Type.STRING },
          riskFactors: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["overallScore", "verdict", "detailedScores", "summaryEvaluation", "futureActions", "milestoneTip", "strategy", "riskFactors"]
      }
    }
  });

  try {
    const result = JSON.parse(response.text.trim());
    return result as BantEvaluation;
  } catch (error) {
    console.error("평가 결과 파싱 실패", error);
    throw new Error("영업 기회 평가 처리 중 오류가 발생했습니다.");
  }
};
