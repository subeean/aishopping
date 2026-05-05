const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "여기에_API_KEY_입력";

const predeterminedScenarios = [
    {
        title: "SNS에서 본 한정 판매 제품",
        titleEn: "Limited-time product seen on social media",
        desc: "관심 있던 브랜드가 오늘 밤까지만 판매하는 제품을 공개했습니다. 가격은 평소 예산보다 조금 높고, 후기는 아직 많지 않습니다.",
        descEn: "A brand the person follows releases a product available only until tonight. The price is slightly above their usual budget, and there are not many reviews yet.",
        options: [
            { id: "A", text: "지금 아니면 사기 어렵다고 판단해 바로 구매한다.", textEn: "Buy it immediately because it may not be available later." },
            { id: "B", text: "장바구니에 넣어두고 후기와 가격 비교를 먼저 확인한다.", textEn: "Add it to the cart, then check reviews and compare prices first." },
            { id: "C", text: "예산을 넘기 때문에 이번에는 구매하지 않는다.", textEn: "Skip it because it exceeds the planned budget." },
            { id: "D", text: "관심 상품으로 저장만 해두고 며칠 뒤에도 필요하면 다시 본다.", textEn: "Save it and reconsider after a few days if it still feels necessary." }
        ]
    },
    {
        title: "주말 결혼식 하객룩 준비",
        titleEn: "Preparing an outfit for a weekend wedding",
        desc: "다음 주말 결혼식에 참석해야 합니다. 기존 옷도 입을 수는 있지만, 조금 더 깔끔한 옷을 새로 살지 고민됩니다.",
        descEn: "The person is attending a wedding next weekend. They could wear something they already own, but they are considering buying a more polished outfit.",
        options: [
            { id: "A", text: "격식 있는 자리이므로 신뢰하는 브랜드에서 새 옷을 산다.", textEn: "Buy a new outfit from a trusted brand because the occasion is formal." },
            { id: "B", text: "가격대와 활용도를 비교해 평소에도 입을 수 있는 옷을 고른다.", textEn: "Compare price and versatility, then choose something that can be worn again." },
            { id: "C", text: "온라인에서 빠른 배송과 할인 여부를 보고 필요한 것만 산다.", textEn: "Buy only what is needed online after checking fast delivery and discounts." },
            { id: "D", text: "기존 옷을 조합하거나 지인에게 빌려 새 지출을 줄인다.", textEn: "Use existing clothes or borrow from someone to avoid new spending." }
        ]
    },
    {
        title: "무선 이어폰 교체 고민",
        titleEn: "Deciding how to replace broken wireless earbuds",
        desc: "매일 쓰던 무선 이어폰이 고장 났습니다. 바로 새 제품을 살 수도 있고, 당분간 대체품으로 버틸 수도 있습니다.",
        descEn: "The person's everyday wireless earbuds have broken. They can buy a replacement right away or use a temporary alternative for now.",
        options: [
            { id: "A", text: "사용 빈도가 높으니 익숙한 브랜드의 최신 모델을 바로 산다.", textEn: "Buy the latest model from a familiar brand because the product is used frequently." },
            { id: "B", text: "리뷰와 스펙을 비교해 가격 대비 성능이 좋은 모델을 고른다.", textEn: "Compare reviews and specifications, then choose the best value-for-money model." },
            { id: "C", text: "당장 필요한 기능만 되는 저렴한 제품을 산다.", textEn: "Buy an inexpensive model that covers only the essential functions." },
            { id: "D", text: "급하지 않다고 보고 기존 유선 이어폰이나 임시 대체품을 쓴다.", textEn: "Use wired earbuds or another temporary option because replacing them is not urgent." }
        ]
    },
    {
        title: "친한 친구의 생일 선물",
        titleEn: "Choosing a birthday gift for a close friend",
        desc: "친한 친구의 생일 선물을 골라야 합니다. 예산은 5만 원 정도이고, 취향을 어느 정도 알고 있습니다.",
        descEn: "The person needs to choose a birthday gift for a close friend. The budget is about 50,000 KRW, and they know the friend's taste reasonably well.",
        options: [
            { id: "A", text: "작지만 브랜드 인지도가 있는 선물을 고른다.", textEn: "Choose a small gift from a recognizable brand." },
            { id: "B", text: "친구가 실제로 필요하다고 말했던 물건을 산다.", textEn: "Buy something the friend previously said they actually needed." },
            { id: "C", text: "취향이 빗나가지 않도록 상품권이나 기프티콘을 준다.", textEn: "Give a voucher or gift card to avoid choosing something mismatched." },
            { id: "D", text: "요즘 많이 언급되는 아이템 중 친구 취향에 맞는 것을 고른다.", textEn: "Pick a currently popular item that seems to fit the friend's taste." }
        ]
    },
    {
        title: "힘든 하루 후의 보상 소비",
        titleEn: "Reward spending after a difficult day",
        desc: "퇴근길에 유난히 피곤하고 스트레스를 많이 받은 상태입니다. 기분 전환을 위해 무언가를 사고 싶습니다.",
        descEn: "After work, the person feels especially tired and stressed. They want to buy something to improve their mood.",
        options: [
            { id: "A", text: "전부터 사고 싶던 옷이나 전자기기를 바로 구매한다.", textEn: "Buy clothing or electronics they have wanted for a while." },
            { id: "B", text: "좋아하는 음식이나 작은 사치로 오늘만 기분 전환한다.", textEn: "Improve the day with a favorite meal or a small indulgence." },
            { id: "C", text: "편의점이나 카페에서 부담 없는 금액만 쓴다.", textEn: "Spend only a small amount at a convenience store or cafe." },
            { id: "D", text: "감정적으로 사지 않도록 구매를 미루고 집에 간다.", textEn: "Delay spending and go home to avoid emotional buying." }
        ]
    },
    {
        title: "주말 장보기",
        titleEn: "Weekend grocery shopping",
        desc: "식료품을 사러 마트에 왔습니다. 필요한 물건은 대략 정해져 있지만, 매장에는 할인 상품과 신제품도 많습니다.",
        descEn: "The person is grocery shopping. They roughly know what they need, but the store has many discounted items and new products.",
        options: [
            { id: "A", text: "신제품과 눈에 띄는 할인 상품을 보며 유연하게 고른다.", textEn: "Choose flexibly, including new products and noticeable promotions." },
            { id: "B", text: "미리 적어둔 목록을 기준으로 할인율까지 확인해 산다.", textEn: "Follow the prepared list and check discounts before buying." },
            { id: "C", text: "평소 쓰던 브랜드와 익숙한 제품 위주로 빠르게 산다.", textEn: "Quickly buy familiar products and brands used regularly." },
            { id: "D", text: "불필요한 구매를 피하려고 꼭 필요한 품목만 산다.", textEn: "Buy only essential items to avoid unnecessary purchases." }
        ]
    },
    {
        title: "새로운 취미 장비 구매",
        titleEn: "Buying equipment for a new hobby",
        desc: "골프, 테니스, 러닝 같은 새로운 취미를 시작하려고 합니다. 기본 장비를 어느 정도 준비해야 합니다.",
        descEn: "The person is starting a new hobby such as golf, tennis, or running. Some basic equipment is needed.",
        options: [
            { id: "A", text: "처음부터 마음에 드는 브랜드의 장비를 제대로 갖춘다.", textEn: "Start with equipment from a brand they genuinely like." },
            { id: "B", text: "입문자 후기를 찾아보고 합리적인 기본 장비를 산다.", textEn: "Read beginner reviews and buy reasonably priced basic equipment." },
            { id: "C", text: "중고나 대여로 먼저 해본 뒤 계속할지 판단한다.", textEn: "Use secondhand or rental equipment first, then decide whether to continue." },
            { id: "D", text: "초기 비용이 부담되어 장비가 거의 필요 없는 방식부터 시작한다.", textEn: "Start with a low-cost version of the hobby that requires little equipment." }
        ]
    },
    {
        title: "친구들과 휴가 숙소 예약",
        titleEn: "Booking accommodation for a trip with friends",
        desc: "친구들과 여름 휴가 숙소를 정해야 합니다. 위치, 가격, 분위기, 후기 사이에서 선택해야 합니다.",
        descEn: "The person needs to choose accommodation for a summer trip with friends. They must balance location, price, atmosphere, and reviews.",
        options: [
            { id: "A", text: "분위기와 사진이 좋은 숙소를 우선으로 고른다.", textEn: "Prioritize accommodation with a strong atmosphere and good photos." },
            { id: "B", text: "위치, 청결도, 후기, 가격을 비교해 균형 잡힌 곳을 고른다.", textEn: "Compare location, cleanliness, reviews, and price, then choose a balanced option." },
            { id: "C", text: "숙소에는 오래 머물지 않으니 예산을 가장 우선한다.", textEn: "Prioritize budget because they will not spend much time at the accommodation." },
            { id: "D", text: "친구들이 선호하는 조건에 맞추고 큰 이견이 없으면 따른다.", textEn: "Go along with friends' preferences if there is no major objection." }
        ]
    },
    {
        title: "동영상 구독 서비스 결제",
        titleEn: "Deciding whether to pay for a video subscription",
        desc: "무료 체험이 끝났고, 유료 결제를 계속할지 결정해야 합니다. 자주 쓰긴 하지만 매달 나가는 비용이 신경 쓰입니다.",
        descEn: "A free trial has ended, and the person must decide whether to keep paying. They use the service often, but the monthly cost is noticeable.",
        options: [
            { id: "A", text: "자주 쓰는 서비스라면 편의성에 비용을 지불한다.", textEn: "Pay for it because the convenience is worth it for a frequently used service." },
            { id: "B", text: "할인, 가족 요금제, 대체 서비스를 비교한 뒤 결정한다.", textEn: "Compare discounts, family plans, and alternatives before deciding." },
            { id: "C", text: "고정 지출을 늘리고 싶지 않아 일단 해지한다.", textEn: "Cancel for now because they do not want to increase fixed monthly expenses." },
            { id: "D", text: "사용 시간을 줄이는 계기로 보고 결제하지 않는다.", textEn: "Do not pay and use it as a chance to reduce viewing time." }
        ]
    },
    {
        title: "예상 밖의 50만 원 보너스",
        titleEn: "Unexpected 500,000 KRW bonus",
        desc: "예상하지 못한 50만 원이 생겼습니다. 사고 싶던 물건도 있고, 저축이나 주변 사람을 위한 지출도 고려할 수 있습니다.",
        descEn: "The person unexpectedly receives 500,000 KRW. They have items they want to buy, but they could also save it or spend some on people around them.",
        options: [
            { id: "A", text: "미뤄둔 위시리스트 중 가장 갖고 싶던 물건을 산다.", textEn: "Buy the most desired item from a saved wishlist." },
            { id: "B", text: "일부는 나를 위해 쓰고 나머지는 저축한다.", textEn: "Spend part of it on themselves and save the rest." },
            { id: "C", text: "예상 밖의 돈이므로 전액 저축하거나 투자한다.", textEn: "Save or invest the full amount because it was unexpected money." },
            { id: "D", text: "가족이나 가까운 사람과 나누는 데 일부를 쓴다.", textEn: "Use part of it for family or close people." }
        ]
    }
];

function buildEnglishTraitProfile(traits = {}) {
    return {
        personality: {
            extraversion: {
                score: Number(traits.extraversion ?? traits["외향성"] ?? 3),
                scale: "1 = introverted, 5 = extraverted"
            },
            agreeableness: {
                score: Number(traits.agreeableness ?? traits["친화성"] ?? 3),
                scale: "1 = competitive/direct, 5 = cooperative/considerate"
            },
            openness: {
                score: Number(traits.openness ?? traits["개방성"] ?? 3),
                scale: "1 = conventional/cautious, 5 = open to novelty"
            },
            conscientiousness: {
                score: Number(traits.conscientiousness ?? traits["성실성"] ?? 3),
                scale: "1 = spontaneous, 5 = planned/organized"
            },
            neuroticism: {
                score: Number(traits.neuroticism ?? traits["신경성"] ?? 3),
                scale: "1 = emotionally stable, 5 = sensitive/reactive"
            }
        },
        shopping: {
            trendSensitivity: {
                score: Number(traits.trendSensitivity ?? traits["트렌드 민감도"] ?? 3),
                scale: "1 = not trend-sensitive, 5 = highly trend-sensitive"
            },
            snsUsage: {
                score: Number(traits.snsUsage ?? traits["SNS 활용도"] ?? 3),
                scale: "1 = uses social media about once a week, 5 = uses social media five or more times a week"
            },
            priceFlexibility: {
                score: Number(traits.priceFlexibility ?? traits["가성비 무관"] ?? 3),
                scale: "1 = strongly prioritizes value for money, 5 = price is not a major constraint"
            },
            brandSensitivity: {
                score: Number(traits.brandSensitivity ?? traits["브랜드 민감도"] ?? 3),
                scale: "1 = brand is not important, 5 = brand is very important"
            },
            impulseBuying: {
                score: Number(traits.impulseBuying ?? traits["충동 구매율"] ?? 3),
                scale: "1 = planned purchase, 5 = impulsive purchase"
            }
        }
    };
}

function buildScenarioPromptData() {
    return predeterminedScenarios.map((scenario, index) => ({
        id: `Q${index + 1}`,
        title: scenario.titleEn,
        situation: scenario.descEn,
        options: scenario.options.map(option => ({
            id: option.id,
            text: option.textEn
        }))
    }));
}

function extractJsonArray(text = "") {
    const trimmed = text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
    const parsed = JSON.parse(trimmed);

    if (!Array.isArray(parsed)) {
        throw new Error("Model response is not a JSON array.");
    }

    const validOptionIds = new Set(["A", "B", "C", "D"]);
    if (parsed.length !== predeterminedScenarios.length || parsed.some(answer => !validOptionIds.has(answer))) {
        throw new Error("Model response does not contain exactly 10 valid option IDs.");
    }

    return parsed;
}

app.post('/api/simulate', async (req, res) => {
    const traitProfile = buildEnglishTraitProfile(req.body.traits);
    const scenarioPromptData = buildScenarioPromptData();

    const prompt = `
You are simulating a consumer decision-maker for a user study.

Task:
Predict which option this person would choose in each shopping scenario.
Base the prediction only on the trait profile below.
Do not choose the objectively best answer. Choose the answer most consistent with the profile.

Trait profile:
${JSON.stringify(traitProfile, null, 2)}

Shopping scenarios:
${JSON.stringify(scenarioPromptData, null, 2)}

Decision guidance:
- High trend sensitivity and high SNS usage may increase responsiveness to new, social, or visually appealing products.
- High price flexibility may increase willingness to pay for convenience, quality, or brand.
- Low price flexibility means stronger value-for-money and budget control.
- High brand sensitivity may increase preference for trusted or recognizable brands.
- High impulse buying may increase immediate or mood-driven purchases.
- High conscientiousness may increase planned comparison, delayed purchase, or budget discipline.
- High openness may increase willingness to try new products or hobbies.
- High agreeableness may increase consideration of friends, family, or group preference.
- High neuroticism may increase stress-driven decisions or risk avoidance depending on the scenario.

Output rules:
Return only a JSON array of exactly 10 uppercase letters.
Each letter must be one of "A", "B", "C", or "D".
Do not include markdown, commentary, numbering, or explanations.
Example: ["A", "B", "C", "D", "A", "B", "C", "D", "A", "B"]
`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    response_mime_type: "application/json",
                    temperature: 0.25
                }
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Gemini API error: ${response.status} ${errorBody}`);
        }

        const data = await response.json();
        const jsonString = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!jsonString) {
            throw new Error("Gemini response did not include text output.");
        }

        const aiAnswers = extractJsonArray(jsonString);

        res.json({
            scenarios: predeterminedScenarios,
            aiAnswers
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Simulation failed" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));