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
        title: "불매 기업의 서비스",
        titleEn: "Boycotted service: Beliefs vs. Exhaustion",
        desc: "당신은 비윤리적 경영으로 논란이 된 프랜차이즈 카페를 불매 중입니다. 하지만 오늘 너무 피곤하고 스트레스를 받아 당장 커피 수혈이 필요한데, 눈앞에 있는 곳은 그 카페뿐입니다. 다른 카페는 15분을 걸어가야 합니다.",
        descEn: "You are boycotting a cafe franchise due to unethical business practices. However, you are extremely exhausted, stressed, and desperately need coffee right now. This cafe is right in front of you, and the next one is a 15-minute walk away.",
        options: [
            { id: "A", text: "오늘 하루 너무 힘들기 때문에 예외로 두고 당장 커피를 사 마신다.", textEn: "Make an exception just for today and buy the coffee because you are too stressed." },
            { id: "B", text: "불매 원칙이 더 중요하므로 15분을 걸어가서 다른 카페를 이용한다.", textEn: "Walk the extra 15 minutes to another cafe because sticking to the boycott is more important." },
            { id: "C", text: "신념을 지키기 위해 오늘 커피 소비 자체를 포기한다.", textEn: "Give up on buying coffee entirely today to uphold your beliefs." },
            { id: "D", text: "근처 편의점에서 저렴한 캔커피를 사서 타협한다.", textEn: "Compromise by buying a cheap canned coffee from a nearby convenience store." }
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
        title: "결제 시 소액 기부",
        titleEn: "Checkout charity round-up",
        desc: "셀프 계산대에서 결제를 마치려는데, 화면에 '총액의 끝자리를 반올림하여 800원을 환경 단체에 기부하시겠습니까?'라는 팝업이 뜹니다. 뒤에는 사람들이 줄을 서 있습니다.",
        descEn: "You are about to finish paying at a self-checkout kiosk when a pop-up asks, 'Round up your total to donate 800 KRW to an environmental charity?' People are waiting in line behind you.",
        options: [
            { id: "A", text: "소액이기도 하고 빨리 넘어가기 위해 '네'를 누른다.", textEn: "Press 'Yes' because it's a small amount and you want to finish quickly." },
            { id: "B", text: "내 예산 통제가 우선이므로 망설임 없이 '아니오'를 누른다.", textEn: "Press 'No' without hesitation because strictly controlling your budget is the priority." },
            { id: "C", text: "기부는 내가 원하는 곳에 따로 알아보고 하고 싶어 '아니오'를 누른다.", textEn: "Press 'No' because you prefer to research and donate to charities on your own terms." },
            { id: "D", text: "뒤에 사람이 기다리는 것이 신경 쓰여 당황하다가 무심코 '네'를 누른다.", textEn: "Press 'Yes' accidentally because you feel pressured and flustered by the people waiting." }
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
        title: "가치관과 상충하는 선물",
        titleEn: "Conflicting values in gifting",
        desc: "친한 친구가 생일 선물로 특정 브랜드의 '천연 가죽 지갑'을 콕 집어 부탁했습니다. 하지만 당신은 동물권 보호와 친환경 소비를 매우 중요하게 생각합니다.",
        descEn: "A close friend specifically asks for a 'genuine leather wallet' from a certain brand for their birthday. However, you strongly believe in animal rights and strictly practice ethical consumption.",
        options: [
            { id: "A", text: "친구의 생일이고 본인이 원하는 것이므로 가죽 지갑을 사준다.", textEn: "Buy the leather wallet because it's their birthday and it's what they want." },
            { id: "B", text: "유명 브랜드의 고급 '비건 가죽' 지갑을 대안으로 사서 설득한다.", textEn: "Buy a high-end 'vegan leather' wallet from a famous brand as an alternative." },
            { id: "C", text: "내 돈으로 직접 사주기 꺼려지므로 현금이나 백화점 상품권을 준다.", textEn: "Give them cash or a gift card because you feel uncomfortable buying it directly." },
            { id: "D", text: "가치관을 솔직히 설명하고, 완전히 다른 윤리적인 선물을 사준다.", textEn: "Honestly explain your values and buy a completely different, ethical gift." }
        ]
    },
    {
        title: "품절된 한정판과 암표상",
        titleEn: "Sold-out limited edition and scalpers",
        desc: "좋아하는 아티스트나 브랜드의 한정판 굿즈가 발매 1분 만에 품절되었습니다. 중고 거래 앱에 리셀러들이 정가의 2배 가격으로 물건을 올리기 시작했습니다.",
        descEn: "Limited edition merch from your favorite artist or brand sold out in 1 minute. Scalpers on secondhand apps are already selling it for double the retail price.",
        options: [
            { id: "A", text: "너무 갖고 싶고 나중엔 더 비싸질 테니 당장 리셀러에게 웃돈을 주고 산다.", textEn: "Pay the premium to the scalper immediately because you really want it and the price might go up." },
            { id: "B", text: "리셀러의 부당 이득을 용납할 수 없으므로 취소표나 공식 재입고를 끝까지 기다린다.", textEn: "Wait for canceled orders or an official restock because you refuse to let scalpers profit." },
            { id: "C", text: "정품 대신 비슷한 디자인의 저렴한 가품이나 팬들이 만든 비공식 굿즈를 산다.", textEn: "Buy a cheap fake or unofficial fan-made merch with a similar design instead of the official one." },
            { id: "D", text: "정가에 사지 못했다면 인연이 아니라고 생각하고 깔끔하게 포기한다.", textEn: "Give up completely, believing that if you couldn't get it at retail price, it wasn't meant to be." }
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
        title: "친구의 크라우드펀딩 후원",
        titleEn: "Supporting a friend's crowdfunding",
        desc: "친한 동기가 독립 프로젝트로 친환경 굿즈(가방 등) 크라우드펀딩을 열었습니다. 가격이 5만 원으로 꽤 비싸고 당신의 취향도 아닙니다.",
        descEn: "A close classmate has launched a crowdfunding campaign for eco-friendly merch (like bags). It costs 50,000 KRW, which is quite expensive for a student, and it's not your style.",
        options: [
            { id: "A", text: "취향이 아니고 비싸더라도 친구의 도전을 응원하기 위해 5만 원을 후원한다.", textEn: "Support with 50,000 KRW to encourage your friend's challenge, even if it's expensive and not your style." },
            { id: "B", text: "굿즈 대신 가장 저렴한 1만 원짜리 '단순 응원(기부)' 옵션을 선택한다.", textEn: "Choose the cheapest 10,000 KRW 'simple donation' option instead of buying the merch." },
            { id: "C", text: "돈으로 후원하는 대신 내 SNS에 적극적으로 홍보해 준다.", textEn: "Actively promote it on your social media instead of supporting it with money." },
            { id: "D", text: "학생 신분에 부담스러우므로 못 본 척하고 지나간다.", textEn: "Pretend you didn't see it because it's too much of a financial burden for a student." }
        ]
    }
];

function buildEnglishTraitProfile(traits = {}) {
    const getDesc = (trait, score) => {
        const s = Math.max(1, Math.min(5, Number(score))); // Ensure score is between 1 and 5
        const map = {
            extraversion: [
                "1 - Very introverted: Prefers solitude, highly reserved, avoids drawing attention.",
                "2 - Introverted: Reserved, prefers small groups over large gatherings.",
                "3 - Ambivert: Balances social interaction with a need for alone time.",
                "4 - Extraverted: Outgoing, enjoys socializing and being around people.",
                "5 - Very extraverted: Highly sociable, draws energy from constant interaction."
            ],
            agreeableness: [
                "1 - Highly competitive: Direct, prioritizes self-interest and logic over group harmony.",
                "2 - Competitive: Willing to challenge others and prioritize own needs.",
                "3 - Neutral: Balances self-interest with the needs of others.",
                "4 - Cooperative: Empathetic, accommodating, and considerate of others.",
                "5 - Highly agreeable: Strongly prioritizes group harmony, highly empathetic, hates conflict."
            ],
            openness: [
                "1 - Highly conventional: Prefers strict routine, cautious, highly resistant to new things.",
                "2 - Conventional: Prefers the familiar, practical, and traditional.",
                "3 - Neutral: Open to some new things but appreciates familiar routines.",
                "4 - Open: Enjoys novelty, variety, and trying new experiences.",
                "5 - Highly open: Imaginative, constantly seeks out novelty and unconventional ideas."
            ],
            conscientiousness: [
                "1 - Highly spontaneous: Dislikes plans, acts entirely on impulse, disorganized.",
                "2 - Spontaneous: Flexible, prefers going with the flow rather than strict planning.",
                "3 - Neutral: Capable of planning but can adapt to changes.",
                "4 - Organized: Disciplined, prefers structure and making deliberate plans.",
                "5 - Highly conscientious: Strictly disciplined, plans everything meticulously, very budget-conscious."
            ],
            neuroticism: [
                "1 - Highly resilient: Emotionally very stable, not easily swayed by stress or anxiety.",
                "2 - Resilient: Generally calm, handles stressful situations well.",
                "3 - Neutral: Experiences normal levels of stress and emotional reactivity.",
                "4 - Reactive: Prone to stress, easily worried, and emotionally reactive.",
                "5 - Highly neurotic: Highly sensitive, easily overwhelmed, strongly driven by anxiety or mood swings."
            ],
            trendSensitivity: [
                "1 - Ignores trends: Completely unaffected by what is currently popular.",
                "2 - Low sensitivity: Rarely follows trends, prefers timeless items.",
                "3 - Neutral: Aware of trends but doesn't feel compelled to follow them.",
                "4 - Trend-conscious: Likes to keep up with popular styles and new releases.",
                "5 - Highly trend-sensitive: Must have the latest items, heavily influenced by what is trendy."
            ],
            snsUsage: [
                "1 - Rarely uses SNS: Disconnected from social media influence.",
                "2 - Occasional user: Uses SNS sparingly, not heavily influenced by online feeds.",
                "3 - Regular user: Checks SNS somewhat regularly.",
                "4 - Active user: Spends significant time on SNS, influenced by online reviews.",
                "5 - Heavy user: Highly influenced by social media feeds, influencers, and viral items."
            ],
            priceFlexibility: [
                "1 - Strictly budget-bound: Always seeks the absolute lowest price, money is the primary constraint.",
                "2 - Value-conscious: Prioritizes value for money, heavily compares prices.",
                "3 - Neutral: Balances price with quality and convenience.",
                "4 - Quality over price: Willing to pay extra for better quality or convenience.",
                "5 - Price is no object: Budget is rarely a constraint, prioritizes brand, time, and premium quality."
            ],
            brandSensitivity: [
                "1 - Brand-agnostic: Cares only about function, completely ignores brand names.",
                "2 - Low preference: Prefers unbranded or generic goods if the quality is okay.",
                "3 - Neutral: Appreciates good brands but isn't loyal to them.",
                "4 - Brand-conscious: Prefers buying from known, trusted brands.",
                "5 - Highly brand-loyal: Will exclusively buy from famous or premium brands for status and trust."
            ],
            impulseBuying: [
                "1 - Strictly planned: Never buys on impulse, always sticks to a premeditated list.",
                "2 - Mostly planned: Thinks carefully before buying, rarely makes sudden purchases.",
                "3 - Neutral: Occasionally treats themselves but mostly plans purchases.",
                "4 - Impulsive: Often makes sudden purchases if something catches their eye.",
                "5 - Highly impulsive: Frequently buys based on immediate mood or desire, struggles to delay gratification."
            ]
        };
        return map[trait][s - 1];
    };

    return {
        personality: {
            extraversion: getDesc('extraversion', traits.extraversion ?? traits["외향성"] ?? 3),
            agreeableness: getDesc('agreeableness', traits.agreeableness ?? traits["친화성"] ?? 3),
            openness: getDesc('openness', traits.openness ?? traits["개방성"] ?? 3),
            conscientiousness: getDesc('conscientiousness', traits.conscientiousness ?? traits["성실성"] ?? 3),
            neuroticism: getDesc('neuroticism', traits.neuroticism ?? traits["신경성"] ?? 3)
        },
        shoppingHabits: {
            trendSensitivity: getDesc('trendSensitivity', traits.trendSensitivity ?? traits["트렌드 민감도"] ?? 3),
            snsUsage: getDesc('snsUsage', traits.snsUsage ?? traits["SNS 활용도"] ?? 3),
            priceFlexibility: getDesc('priceFlexibility', traits.priceFlexibility ?? traits["가성비 무관"] ?? 3),
            brandSensitivity: getDesc('brandSensitivity', traits.brandSensitivity ?? traits["브랜드 민감도"] ?? 3),
            impulseBuying: getDesc('impulseBuying', traits.impulseBuying ?? traits["충동 구매율"] ?? 3)
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

    // AI가 추론 과정(reasoning)을 거친 후 내놓은 answers 배열만 추출
    const answers = parsed.answers || parsed; 

    if (!Array.isArray(answers)) {
        throw new Error("Model response does not contain an answers array.");
    }

    const validOptionIds = new Set(["A", "B", "C", "D"]);
    if (answers.length !== predeterminedScenarios.length || answers.some(ans => !validOptionIds.has(ans))) {
        throw new Error("Model response does not contain exactly 10 valid option IDs.");
    }

    return answers;
}

app.post('/api/simulate', async (req, res) => {
    const requestId = Date.now().toString();
    const requestStartTime = Date.now();

    console.log(`[Backend][${requestId}] Received /api/simulate request`);
    console.log(`[Backend][${requestId}] Request traits:`, req.body.traits);

    const traitProfile = buildEnglishTraitProfile(req.body.traits);
    const scenarioPromptData = buildScenarioPromptData();

    const statusMap = {
        "student": "Student / Job-seeker (Tight budget, heavily prioritizes saving and value-for-money)",
        "worker_junior": "Junior employee (Some disposable income, balances between saving and occasional treats)",
        "worker_senior": "Established professional (High disposable income, prioritizes time, convenience, and quality over strict budget)"
    };

    const currentLifeStage = statusMap[req.body.traits.userStatus] || statusMap["worker_junior"];

    const prompt = `
You are simulating a consumer decision-maker for a user study.

Task:
Predict which option this person would choose in each shopping scenario.
Base the prediction only on the trait profile below.
Do not choose the objectively best answer. Choose the answer most consistent with the profile.

Current Life Stage & Financial Context:
${currentLifeStage}

Trait profile:
${JSON.stringify(traitProfile, null, 2)}

Shopping scenarios:
${JSON.stringify(scenarioPromptData, null, 2)}

Decision guidance:
- Consider the "Current Life Stage" as the foundational budget constraint. A tight budget might override high impulse buying or brand sensitivity.
- High trend sensitivity and high SNS usage may increase responsiveness to new, social, or visually appealing products.
- High price flexibility may increase willingness to pay for convenience, quality, or brand.
- Low price flexibility means stronger value-for-money and budget control.
- High brand sensitivity may increase preference for trusted or recognizable brands.
- High impulse buying may increase immediate or mood-driven purchases.
- High conscientiousness may increase planned comparison, delayed purchase, or budget discipline.
- High openness may increase willingness to try new products or hobbies.
- High agreeableness may increase consideration of friends, family, or group preference.
- High neuroticism may increase stress-driven decisions or risk avoidance depending on the scenario.

Decision guidance (Conflict Resolution):
- If "price flexibility" is low (1-2), it acts as an absolute constraint. Even if "trend sensitivity" or "impulse buying" is high, budget limits will force a conservative choice (e.g., delaying purchase, comparing prices).
- "Agreeableness" overrides personal preference when the scenario involves other people (e.g., gifts, group trips).
- If "neuroticism" is high and the situation is stressful, "impulse buying" is heavily amplified as a coping mechanism.

Output rules:
Return a JSON object with two keys:
1. "reasoning": A brief 1-sentence analysis of WHY the user would choose the option for each of the 10 scenarios based on their traits. (Array of 10 strings)
2. "answers": An array of exactly 10 uppercase letters ("A", "B", "C", or "D") representing the final choices.

Example:
{
  "reasoning": [
    "High trend sensitivity and SNS usage make them prone to limited editions.",
    "Low price flexibility means they will reuse existing clothes."
    // ... 8 more ...
  ],
  "answers": ["A", "D", "B", "C", "A", "B", "C", "D", "A", "B"]
`;

    try {
        console.log(`[Backend][${requestId}] Sending request to Gemini`);
        const geminiStartTime = Date.now();

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    response_mime_type: "application/json",
                    temperature: 0.1
                }
            })
        });

        const geminiElapsed = Date.now() - geminiStartTime;

        console.log(`[Backend][${requestId}] Gemini responded in ${geminiElapsed}ms`);
        console.log(`[Backend][${requestId}] Gemini response status: ${response.status}`);

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[Backend][${requestId}] Gemini API error body:`, errorBody);
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();

        console.log(`[Backend][${requestId}] Gemini raw response received`);

        const jsonString = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!jsonString) {
            throw new Error("Gemini response did not include text output.");
        }

        console.log(`[Backend][${requestId}] Gemini text output:`, jsonString);

        const aiAnswers = extractJsonArray(jsonString);

        console.log(`[Backend][${requestId}] Parsed AI answers:`, aiAnswers);

        res.json({
            scenarios: predeterminedScenarios,
            aiAnswers
        });

        const totalElapsed = Date.now() - requestStartTime;
        console.log(`[Backend][${requestId}] Sent response to frontend in ${totalElapsed}ms`);

    } catch (error) {
        const totalElapsed = Date.now() - requestStartTime;

        console.error(`[Backend][${requestId}] Simulation failed after ${totalElapsed}ms`);
        console.error(`[Backend][${requestId}] Error:`, error);

        res.status(500).json({ error: "Simulation failed" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
