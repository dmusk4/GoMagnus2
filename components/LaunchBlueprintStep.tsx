
import React from 'react';
import { 
  FileText, Printer, Loader2, Sparkles, CheckCircle, 
  Target, Users, BarChart, Zap, Clapperboard, Layout, 
  ShieldCheck, Globe, Star, RefreshCw,
  Gift, Shield, DollarSign, Mail, 
  TrendingUp, Info, 
  Inbox, Video, AlertTriangle, Grid, XCircle, Palette, FileJson, Briefcase, Rocket, Scale, Clock, Monitor
} from 'lucide-react';
import { Product, Language } from '../types';
import { getTranslation } from '../translations';

import { jsPDF } from "jspdf";

interface LaunchBlueprintStepProps {
  product: Product;
  language: Language;
  loading: boolean;
  onGenerate: () => void | Promise<void>;
}

export const LaunchBlueprintStep: React.FC<LaunchBlueprintStepProps> = ({ product, language, loading, onGenerate }) => {
  const blueprint = product.launchBlueprint;
  const t = getTranslation(language);

  const handleExportPDF = () => {
    if (!blueprint) return;
    
    const doc = new jsPDF();
    let y = 20;
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxLineWidth = pageWidth - margin * 2;
    const pageHeight = doc.internal.pageSize.getHeight();

    const getLabel = (en: string, pt: string, es: string) => {
        if (language === 'pt') return pt;
        if (language === 'es') return es;
        return en;
    };

    const checkPageBreak = (height: number) => {
        if (y + height > pageHeight - margin) {
            doc.addPage();
            y = margin + 10;
        }
    };

    const addTitle = (text: string, size = 16, isBold = true, spaceAfter = 8, color = [0,0,0]) => {
        checkPageBreak(size * 0.7);
        doc.setFontSize(size);
        doc.setTextColor(color[0], color[1], color[2]);
        doc.setFont("helvetica", isBold ? "bold" : "normal");
        const lines = doc.splitTextToSize(String(text), maxLineWidth);
        const textHeight = lines.length * (size * 0.35); // Approx height factor
        checkPageBreak(textHeight);
        doc.text(lines, margin, y);
        y += textHeight + spaceAfter;
        doc.setTextColor(0, 0, 0);
    };

    const addText = (text: string | undefined, size = 11, spaceAfter = 6, isItalic = false) => {
        if (!text) return;
        doc.setFontSize(size);
        doc.setFont("helvetica", isItalic ? "italic" : "normal");
        const lines = doc.splitTextToSize(String(text), maxLineWidth);
        const textHeight = lines.length * (size * 0.35); // Approx height factor
        checkPageBreak(textHeight);
        doc.text(lines, margin, y);
        y += textHeight + spaceAfter;
    };

    const addSectionHeader = (title: string, stepNum: string) => {
        checkPageBreak(45);
        y += 10;
        addTitle(`${stepNum} ${title.toUpperCase()}`, 16, true, 8, [30, 41, 59]);
        doc.setDrawColor(30, 41, 59);
        doc.setLineWidth(0.8);
        doc.line(margin, y - 5, pageWidth - margin, y - 5);
        y += 5;
    };

    const tryAddImage = (imgUrl: string | undefined, w = 40, h = 40, centered = false) => {
        if (!imgUrl) return false;
        if (imgUrl.startsWith('data:image')) {
            checkPageBreak(h + 10);
            try {
                let format = 'JPEG';
                if (imgUrl.includes('image/png')) format = 'PNG';
                else if (imgUrl.includes('image/webp')) format = 'WEBP';
                const xPos = centered ? (pageWidth - w) / 2 : margin;
                doc.addImage(imgUrl, format, xPos, y, w, h);
                y += h + 8;
                return true;
            } catch (e) {
                console.error("Failed adding image", e);
            }
        }
        return false;
    };

    // --- Dossier Cover Header ---
    doc.setFillColor(30, 41, 59); // slate-900
    doc.rect(0, 0, pageWidth, 55, "F");
    y = 22;
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(`${product.name.toUpperCase()}`, margin, y);
    y += 8;
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(200, 200, 255);
    doc.text(`STRATEGY BLUEPRINT DOSSIER`, margin, y);
    y += 8;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(160, 160, 160);
    const confidentialLabel = t.blueprintStep.confidential || "CONFIDENTIAL STRATEGIC RECORD";
    doc.text(`${confidentialLabel} | ${t.blueprintStep.generatedOn || "Generated on"}: ${new Date().toLocaleDateString()}`, margin, y);
    
    y = 70;
    doc.setTextColor(0, 0, 0);

    // --- Overview Context tags ---
    let contextStr = [];
    if (product.location) contextStr.push(`Location: ${product.location}`);
    if (product.audienceType) contextStr.push(`Audience: ${product.audienceType}`);
    if (product.goal) contextStr.push(`Goal: ${product.goal}`);
    if (contextStr.length > 0) {
        addText(contextStr.join("   |   "), 10, 12, true);
        doc.setDrawColor(220, 220, 220);
        doc.line(margin, y - 5, pageWidth - margin, y - 5);
        y += 5;
    }

    // ==========================================
    // STEP 1: Overview / Executive Summary
    // ==========================================
    addSectionHeader(t.blueprintStep.execSummary || "Executive Perspective", "1.");
    addText(blueprint.productSummary, 11, 10);

    if (blueprint.currentState) {
        addTitle(t.blueprintStep.currentState || "Current State Analysis", 12, true, 4);
        addText(blueprint.currentState, 10, 8, true);
    }
    if (blueprint.priorityInitiatives && blueprint.priorityInitiatives.length > 0) {
        addTitle(t.blueprintStep.priorityInitiatives || "Priority Initiatives", 12, true, 4);
        blueprint.priorityInitiatives.forEach((init, i) => addText(`${i + 1}. ${init}`, 10, 4));
        y += 4;
    }
    if (blueprint.resourceRequirements) {
        addTitle(t.blueprintStep.resourceRequirements || "Resource Requirements", 12, true, 4);
        addText(blueprint.resourceRequirements, 10, 8);
    }
    if (blueprint.decisionFramework) {
        addTitle(t.blueprintStep.decisionFramework || "Decision Framework", 12, true, 4);
        addText(blueprint.decisionFramework, 10, 8);
    }
    if (blueprint.oneHourBrief) {
        addTitle(t.blueprintStep.oneHourBrief || "The One-Hour action brief", 12, true, 4);
        addText(blueprint.oneHourBrief, 10, 8);
    }

    // ==========================================
    // STEP 2: Dream Buyer ICP Profile
    // ==========================================
    addSectionHeader(t.blueprintStep.buyerInsights || "Dream Buyer Profile", "2.");
    addText(blueprint.buyerSummary, 11, 10);

    if (product.dreamBuyer) {
        if (product.dreamBuyer.avatarUrl) {
            tryAddImage(product.dreamBuyer.avatarUrl, 35, 35, false);
        }
        
        addTitle(`${getLabel("Target Identity", "Identidade do Alvo", "Identidad del Objetivo")}: ${product.dreamBuyer.name} (${product.dreamBuyer.archetype})`, 12, true, 4);
        addText(`Demographics: ${product.dreamBuyer.ageRange}, ${product.dreamBuyer.occupation} | Income: ${product.dreamBuyer.income || 'N/A'}`, 10, 8);
        
        addTitle(t.blueprintStep.burningPain || "Burning Pain Point", 10, true, 2);
        addText(product.dreamBuyer.painPoint, 10, 6, true);
        
        addTitle(t.blueprintStep.deepestDesire || "Deepest Desire", 10, true, 2);
        addText(product.dreamBuyer.desire, 10, 6, true);
        
        addTitle(t.blueprintStep.barrierObjection || "Main Barrier / Objection", 10, true, 2);
        addText(product.dreamBuyer.objection, 10, 6, true);
        
        if (product.dreamBuyer.mediaConsumption) {
             addTitle(t.dreamBuyerStep?.mediaConsumption || "Media Diet / Where they hang out", 10, true, 2);
             addText(product.dreamBuyer.mediaConsumption, 10, 6);
        }
    }

    // ==========================================
    // STEP 3: Market Intelligence
    // ==========================================
    addSectionHeader(t.blueprintStep.marketLandscape || "Market Intelligence", "3.");
    addText(blueprint.marketSummary, 11, 10);

    if (product.marketIntel) {
        if (product.marketIntel.workingNow && product.marketIntel.workingNow.length > 0) {
            addTitle(t.marketIntelStep?.winningPatterns || "Winning Patterns (What's working right now)", 11, true, 4, [30, 110, 60]);
            product.marketIntel.workingNow.forEach(item => addText(`• ${item}`, 10, 4));
            y += 4;
        }
        if (product.marketIntel.saturated && product.marketIntel.saturated.length > 0) {
            addTitle(t.marketIntelStep?.saturatedAngles || "Saturated Angles (What to avoid)", 11, true, 4, [150, 40, 40]);
            product.marketIntel.saturated.forEach(item => addText(`• ${item}`, 10, 4));
            y += 4;
        }
        if (product.marketIntel.opportunities && product.marketIntel.opportunities.length > 0) {
            addTitle(t.marketIntelStep?.gapOpportunities || "Gap Opportunities", 11, true, 4, [60, 60, 150]);
            product.marketIntel.opportunities.forEach(item => addText(`• ${item}`, 10, 4));
            y += 6;
        }
        if (product.marketIntel.pricingSuggestions) {
            addTitle(t.blueprintStep.yieldStrategy || "Proposed Pricing Strategy", 12, true, 4);
            const pricing = product.marketIntel.pricingSuggestions;
            
            addTitle(`> ${t.blueprintStep.disruptivePricing || "Disruptive Pricing"}: ${pricing.sameForLess.price}`, 10, true, 2);
            addText(pricing.sameForLess.logic, 10, 4);
            if (pricing.sameForLess.valueAdd && pricing.sameForLess.valueAdd.length > 0) {
                pricing.sameForLess.valueAdd.forEach(va => addText(`  + ${va}`, 9, 3));
            }
            
            addTitle(`> ${t.blueprintStep.marketLeader || "Premium Market Leader"}: ${pricing.moreForSame.price}`, 10, true, 2);
            addText(pricing.moreForSame.logic, 10, 4);
            if (pricing.moreForSame.valueAdd && pricing.moreForSame.valueAdd.length > 0) {
                pricing.moreForSame.valueAdd.forEach(va => addText(`  + ${va}`, 9, 3));
            }

            if (pricing.monetization) {
                addTitle(`> ${getLabel("Monetization & Expansion Models", "Modelos de Monetização & Expansão", "Modelos de Monetización y Expansión")}`, 11, true, 3);
                const mon = pricing.monetization;
                if (mon.opportunities) {
                    if (mon.opportunities.upsells && mon.opportunities.upsells.length > 0) {
                        addTitle("  - Upsell Opportunities:", 9, true, 2);
                        mon.opportunities.upsells.forEach(up => addText(`    * ${up}`, 9, 3));
                    }
                    if (mon.opportunities.crossSells && mon.opportunities.crossSells.length > 0) {
                        addTitle("  - Cross-Sell Opportunities:", 9, true, 2);
                        mon.opportunities.crossSells.forEach(cs => addText(`    * ${cs}`, 9, 3));
                    }
                    if (mon.opportunities.usageBased) {
                        addTitle("  - Usage-Based Pricing Logic:", 9, true, 2);
                        addText(`    ${mon.opportunities.usageBased}`, 9, 3);
                    }
                }
                if (mon.discountStrategy) {
                    addTitle("  - Discount Tactical Protocol:", 10, true, 2);
                    addText(`    When: ${mon.discountStrategy.when} | Amount: ${mon.discountStrategy.amount} | Target Audience: ${mon.discountStrategy.audience}`, 9, 4);
                }
            }
        }
        
        if (product.marketIntel.competitors && product.marketIntel.competitors.length > 0) {
            addTitle(t.blueprintStep.competitiveRadar || "Active Competitor Radar", 12, true, 4);
            product.marketIntel.competitors.forEach((comp, i) => {
                addTitle(`${i+1}. ${comp.name} (${comp.pricePoint})`, 11, true, 2);
                if (comp.url) addText(`Url: ${comp.url}`, 9, 3);
                if (comp.rating) addText(`Rating: ${comp.rating} ★ (${comp.reviewCount || "N/A"} reviews)`, 9, 3);
                
                addText(`Strength: ${comp.strength || "N/A"}\nWeakness: ${comp.weakness || "N/A"}`, 10, 4);
                
                if (comp.strategicMoves && comp.strategicMoves.length > 0) {
                    addTitle("  Strategic Moves & Threat Level:", 9, true, 2);
                    comp.strategicMoves.forEach(mv => addText(`    • ${mv}`, 9, 3));
                }
                
                if (comp.reviewInsights) {
                    const ri = comp.reviewInsights;
                    if (ri.whatTheyLove && ri.whatTheyLove.length > 0) {
                        addTitle("    What users love:", 9, true, 2);
                        ri.whatTheyLove.slice(0, 3).forEach(el => addText(`      + ${el}`, 9, 2));
                    }
                    if (ri.commonComplaints && ri.commonComplaints.length > 0) {
                        addTitle("    Common complaints / gaps:", 9, true, 2);
                        ri.commonComplaints.slice(0, 3).forEach(el => addText(`      - ${el}`, 9, 2));
                    }
                }
                y += 3;
            });
        }

        if (product.marketIntel.ownBrandInsights) {
            const obi = product.marketIntel.ownBrandInsights;
            addTitle(getLabel("Brand Reputation Audit", "Auditoria de Reputação da Marca", "Auditoría de Reputación de Marca"), 11, true, 4);
            addText(`Sentiment Benchmark Score: ${obi.sentimentScore}/100`, 10, 4);
            if (obi.positives && obi.positives.length > 0) {
                addTitle("Verified Praises / Positives:", 9, true, 2);
                obi.positives.forEach(pos => addText(`  + ${pos}`, 9, 3));
            }
            if (obi.negatives && obi.negatives.length > 0) {
                addTitle("Verified Gaps / Negative Frictions:", 9, true, 2);
                obi.negatives.forEach(neg => addText(`  - ${neg}`, 9, 3));
            }
            y += 4;
        }

        if (product.marketIntel.leanCanvas) {
            const lc = product.marketIntel.leanCanvas;
            addTitle("Lean Canvas Matrix", 12, true, 6, [30, 41, 59]);
            addTitle("1. Problem Context", 10, true, 2); addText(lc.problem, 9, 4);
            addTitle("2. Solution Proposed", 10, true, 2); addText(lc.solution, 9, 4);
            addTitle("3. Unique Value Proposition", 10, true, 2); addText(lc.uniqueValueProp, 9, 4);
            addTitle("4. Unfair Advantage", 10, true, 2); addText(lc.unfairAdvantage, 9, 4);
            addTitle("5. Customer Segments", 10, true, 2); addText(lc.customerSegments, 9, 4);
            addTitle("6. Delivery channels", 10, true, 2); addText(lc.channels, 9, 4);
            addTitle("7. Key Metrics to Watch", 10, true, 2); addText(lc.keyMetrics, 9, 4);
            addTitle("8. Cost Structure", 10, true, 2); addText(lc.costStructure, 9, 4);
            addTitle("9. Revenue Streams", 10, true, 2); addText(lc.revenueStreams, 9, 6);
        }
    }

    // ==========================================
    // STEP 4: Campaign Action Plan / Launch Sequence
    // ==========================================
    addSectionHeader(t.blueprintStep.growthSequence || "Launch Action Plan", "4.");
    addText(blueprint.planSummary, 11, 10);

    if (product.campaignPlan) {
        const cp = product.campaignPlan;
        addTitle(getLabel("Strategic Directive", "Diretriz Estratégica", "Directiva Estratégica"), 12, true, 4);
        addText(`Direction: ${cp.direction}`, 10, 4, true);
        addText(`Goal: ${cp.goal}`, 10, 4);
        addText(`Core Slogan / Hook: "${cp.coreMessage}"`, 11, 6, true);
        if (cp.marketNuance) {
            addTitle(getLabel("Geographical & Cultural Nuance", "Nuance Geográfica e Cultural", "Matiz Geográfico y Cultural"), 10, true, 2);
            addText(cp.marketNuance, 10, 6);
        }
        
        addTitle(getLabel("Operational Traffic Setup", "Configuração de Tráfego Operacional", "Configuración de Tráfico Operativo"), 11, true, 4);
        addText(`Platform Hub: ${cp.channelSetup.platform}`, 10, 3);
        addText(`Budget Recommendation: ${cp.channelSetup.budgetRange}`, 10, 3);
        addText(`Test Duration: ${cp.channelSetup.testDuration}`, 10, 3);
        addText(`Rationale: ${cp.channelSetup.whyThisPlatform}`, 10, 8);

        addTitle(t.campaignPlanStep?.launchSteps || "Step-by-Step Launch Sequence", 12, true, 4);
        cp.launchSteps.forEach((step, i) => addText(`${i + 1}. ${step}`, 10, 4));
        y += 4;

        if (cp.viralInitiative) {
            addTitle(getLabel("Growth Catalyst (Viral Vector)", "Catalisador de Crescimento (Vetor Viral)", "Catalizador de Crecimiento (Vector Viral)"), 11, true, 2);
            addText(`"${cp.viralInitiative}"`, 10, 6, true);
        }

        if (cp.quickWins) {
            addTitle(getLabel("Tactical Quick Wins", "Vitórias Rápidas (Quick Wins)", "Victorias Rápidas (Quick Wins)"), 11, true, 4);
            if (cp.quickWins.tactics && cp.quickWins.tactics.length > 0) {
                addTitle("  Immediate Launch Tactics:", 9, true, 2);
                cp.quickWins.tactics.forEach(tac => addText(`    • ${tac}`, 10, 3));
            }
            if (cp.quickWins.partnerships && cp.quickWins.partnerships.length > 0) {
                addTitle("  Leverage Partners & Co-marketing:", 9, true, 2);
                cp.quickWins.partnerships.forEach(part => addText(`    • ${part}`, 10, 3));
            }
            y += 4;
        }

        if (cp.firstSignals) {
            addTitle(t.campaignPlanStep?.signals || "Early Warning Signals", 11, true, 4);
            if (cp.firstSignals.goodSigns && cp.firstSignals.goodSigns.length > 0) {
                addTitle(`  ${t.campaignPlanStep?.goodSigns || "Positive Signs"}:`, 9, true, 2, [30, 110, 60]);
                cp.firstSignals.goodSigns.forEach(sig => addText(`    + ${sig}`, 10, 3));
            }
            if (cp.firstSignals.redFlags && cp.firstSignals.redFlags.length > 0) {
                addTitle(`  ${t.campaignPlanStep?.redFlags || "Red Flags"}:`, 9, true, 2, [150, 40, 40]);
                cp.firstSignals.redFlags.forEach(flag => addText(`    - ${flag}`, 10, 3));
            }
            y += 4;
        }

        if (cp.keywords && cp.keywords.length > 0) {
            addTitle(getLabel("Validated Search Term Keywords", "Palavras-Chave de Intenção Validadas", "Palabras Clave de Intención Validadas"), 11, true, 4);
            cp.keywords.forEach(kw => {
                addText(`- ${kw.term}: Search Volume: ${kw.volume} | CPC Benchmark: ${kw.cpc} | Fit: ${kw.relevance}`, 10, 4);
            });
            y += 4;
        }

        if (cp.plgStrategy && cp.plgStrategy.length > 0) {
            addTitle(getLabel("Product-Led Growth (PLG) Engine", "Motor de Lançamento Baseado em Canal (PLG)", "Motor de Lanzamiento Basado en Canal (PLG)"), 11, true, 4);
            cp.plgStrategy.forEach(block => {
                addTitle(`  Stage: ${block.stage}`, 10, true, 2);
                addText(`  Goal: ${block.goal}`, 9, 3);
                if (block.actions && block.actions.length > 0) {
                    addText(`  Actions: ${block.actions.join(", ")}`, 9, 4);
                }
            });
            y += 4;
        }

        if (cp.creativeRecommendations && cp.creativeRecommendations.length > 0) {
            addTitle(getLabel("Suggested Creative Asset Deliverables", "Entregáveis Recomendados de Criativos", "Entregables Recomendados de Creativos"), 11, true, 4);
            cp.creativeRecommendations.forEach(rec => {
                addText(`  • ${rec.type} (Qty: ${rec.count}) - Prioridade: ${rec.priority} | Reason: ${rec.reason}`, 10, 4);
            });
            y += 4;
        }

        if (cp.b2bSuggestions) {
            addTitle(getLabel("Enterprise B2B Segment Setup", "Configurações de Prospecção B2B Corporativa", "Configuración de Prospección B2B Corporativa"), 11, true, 4);
            const b2b = cp.b2bSuggestions;
            if (b2b.industries && b2b.industries.length > 0) {
                addText(`Target Sectors: ${b2b.industries.join(", ")}`, 10, 3);
            }
            if (b2b.jobTitles && b2b.jobTitles.length > 0) {
                addText(`Target Profiles: ${b2b.jobTitles.join(", ")}`, 10, 3);
            }
            if (b2b.seniorityLevels && b2b.seniorityLevels.length > 0) {
                addText(`Target Seniority: ${b2b.seniorityLevels.join(", ")}`, 10, 4);
            }
            if (cp.b2bTriggers && cp.b2bTriggers.length > 0) {
                addTitle("Target Conversion Hooks & B2B Triggers:", 10, true, 2);
                cp.b2bTriggers.forEach(tri => {
                    addText(`  * Trigger: ${tri.name} (Type: ${tri.type} | Date: ${tri.date})`, 9, 3);
                    addText(`    Description: ${tri.description}`, 9, 4);
                });
            }
            y += 4;
        }

        if (cp.growthHackAutomation && cp.growthHackAutomation.length > 0) {
            addTitle(getLabel("Growth Marketing Automation Protocols", "Protocolos de Automação e Hacks de Crescimento", "Protocolos de Automatización y Hacks de Crecimiento"), 12, true, 6, [40, 40, 150]);
            cp.growthHackAutomation.forEach(hack => {
                addTitle(`> Protocol: ${hack.title}`, 11, true, 3);
                addTitle("  Objective:", 9, true, 1);
                addText(`  ${hack.objective}`, 9, 3);
                
                addTitle("  Overview Strategy:", 9, true, 1);
                addText(`  ${hack.overview}`, 9, 3);
                
                addTitle("  Ultimate Outcome Expected:", 9, true, 1);
                addText(`  ${hack.ultimateOutcome}`, 9, 3);
                
                addTitle("  Why this protocol works:", 9, true, 1);
                addText(`  ${hack.why}`, 9, 3);
                
                addTitle("  Recommended Lead AI Orchestrator Agent:", 10, true, 2);
                addText(`  ${hack.aiAgent}`, 9, 4);

                if (hack.subAgents && hack.subAgents.length > 0) {
                    addTitle("  Required Support Agents Stack:", 9, true, 2);
                    hack.subAgents.forEach(sub => {
                        addText(`    * Agent Name: ${sub.name} (Role: ${sub.role})`, 9, 2);
                        addText(`      Required skills: ${sub.skills.join(", ")}`, 9, 4);
                    });
                }

                if (hack.initialPrompt) {
                    addTitle("  Kickstart Deployment Instructions & Setup AI Prompt (Master copy):", 9, true, 2);
                    checkPageBreak(30);
                    doc.setDrawColor(220, 220, 255);
                    doc.setFillColor(245, 245, 255);
                    const promptLines = doc.splitTextToSize(hack.initialPrompt, maxLineWidth - 10);
                    const promptHeight = promptLines.length * 4;
                    checkPageBreak(promptHeight + 6);
                    doc.rect(margin, y, maxLineWidth, promptHeight + 4, "F");
                    doc.setFontSize(8.5);
                    doc.setFont("courier", "normal");
                    doc.text(promptLines, margin + 5, y + 4);
                    y += promptHeight + 10;
                    doc.setFont("helvetica", "normal");
                }

                if (hack.tasks && hack.tasks.length > 0) {
                    addTitle("  Deployment Milestones:", 9, true, 2);
                    hack.tasks.forEach((t, index) => addText(`    [ ] ${index+1}. ${t}`, 9, 3));
                }
                
                y += 6;
            });
        }

        if (cp.nextMove) {
            addTitle(getLabel("Critical First Execution Action Move", "Ação de Lançamento Crítica Imediata", "Acción de Lanzamiento Crítica Inmediata"), 11, true, 2);
            addText(`Next Action: "${cp.nextMove}"`, 11, 8, true);
        }
    }

    // ==========================================
    // STEP 5: Offer Architecture
    // ==========================================
    addSectionHeader(t.blueprintStep.offerArchitecture || "Offer Architecture", "5.");
    addText(blueprint.offerSummary, 11, 10);

    if (product.offer) {
        addTitle(t.offerStep?.corePromise || "Irresistible Slogan & Promise Headline", 12, true, 4);
        addTitle(`"${product.offer.headline}"`, 14, false, 8, [150, 80, 20]);
        
        if (product.bigIdea) {
            addTitle(getLabel("The Big Idea Anchor Hypothesis", "Slogan âncora e Fundamentação da Big Idea", "Slogan ancla y Fundamentación de la Big Idea"), 11, true, 4);
            if (product.bigIdea.tagline) addText(`Hook Tagline: "${product.bigIdea.tagline}"`, 10, 4, true);
            if (product.bigIdea.uniqueMechanism) {
                addTitle("Unique Mechanism Explained:", 10, true, 2);
                addText(product.bigIdea.uniqueMechanism, 10, 6);
            }
        }
        
        if (product.offer.riskReversal) {
            addTitle(t.offerStep?.guaranteeTitle || "Pillared Value Success Guarantee / Risk Reversal", 11, true, 2);
            addText(product.offer.riskReversal, 10, 6);
        }
        
        if (product.offer.priceAnchor) {
            addTitle(t.offerStep?.investmentLogic || "Optimized Price Frame & Price Anchor", 11, true, 2);
            addText(product.offer.priceAnchor, 10, 6);
        }

        if (product.offer.bonuses && product.offer.bonuses.length > 0) {
            addTitle(t.offerStep?.valueStack || "Irresistible Bonus Stack Value", 11, true, 4);
            product.offer.bonuses.forEach((b, index) => {
                addTitle(`  Bonus ${index+1}: ${b.title} (Valued: ${b.value})`, 10, true, 2);
                if (b.description) {
                    addText(`  Rationale / Obstacle resolved: ${b.description}`, 9, 4);
                }
            });
            y += 4;
        }
    }

    // ==========================================
    // STEP 6: Creative Ecosystem
    // ==========================================
    addSectionHeader(t.blueprintStep.creativeDirection || "Creative Ecosystem", "6.");
    addText(blueprint.creativeSummary, 11, 10);

    if (product.creatives && product.creatives.length > 0) {
        addTitle(getLabel("Engineered Visual Creatives Catalog", "Catálogo Criativo Visual Gerado", "Catálogo Creativo Visual Generado"), 12, true, 4);
        product.creatives.forEach((c, idx) => {
            addTitle(`${idx + 1}. Theme: ${c.style || "Visual Theme"} (Hook: "${c.hook || ""}")`, 11, true, 3);
            addText(`Headline: "${c.headline || ""}"`, 10, 3);
            addText(`Caption: "${c.caption || ""}"`, 10, 4, true);
            if (c.visualPrompt) addText(`Creative Canvas Prompt: ${c.visualPrompt}`, 9, 3);
            if (c.imageUrl) {
                tryAddImage(c.imageUrl, 40, 40, false);
            }
            y += 6;
        });
    }

    if (product.emailCampaign) {
        addTitle(`CRM Nurture Flows: "${product.emailCampaign.category}"`, 12, true, 4);
        product.emailCampaign.emails.forEach((e, idx) => {
            addTitle(`  Email ${idx + 1} Slogan: "${e.subject}"`, 11, true, 3);
            addText(e.body, 10, 6);
        });
        y += 4;
    }
    
    if (product.storyboards && product.storyboards.length > 0) {
        product.storyboards.forEach((sb, sIdx) => {
            addTitle(`Primary Video Storyboard Architecture: "${sb.title}"`, 12, true, 4);
            sb.scenes.forEach((s) => {
                addTitle(`  Scene ${s.number} [Energy Level Pacing: ${s.energyTag}] [Timing Duration: ${s.timing}]`, 10, true, 2);
                addText(`  Visual Frame Shot: ${s.shotDetails}`, 10, 3);
                addText(`  Teleprompter Narration: "${s.voiceover}"`, 10, 3, true);
                if (s.onScreenText) addText(`  On-Screen Overlay Label Text: ${s.onScreenText}`, 9, 4);
            });
            y += 4;
        });
    }

    // ==========================================
    // STEP 7: Visual Brand DNA
    // ==========================================
    const brandKit = product.designDirectorData?.brandKit || product.brandKit;
    const designSettings = product.designDirectorData?.settings || product.lpBuilderData?.copy?.designRecommendation;
    const colors = brandKit?.colors || (product.salesPage?.visualIdentity?.primaryColor ? [product.salesPage.visualIdentity.primaryColor, product.salesPage.visualIdentity.secondaryColor, product.salesPage.visualIdentity.backgroundColor] : []);
    const typography = designSettings?.typography || (brandKit as any)?.fontHeadline || (brandKit as any)?.fontPairingRecommendation || "Sans-Serif Modern";

    if (colors.length > 0 || typography) {
        addSectionHeader(getLabel("Visual Brand DNA", "DNA Visual da Marca", "DNA Visual de la Marca"), "7.");
        if (colors.length > 0) {
            addTitle("Hex Swatch Color Palette Scheme:", 11, true, 2);
            let colorStr = colors.join("   |   ");
            addText(colorStr, 10, 6);
        }
        if (typography) {
            addTitle("Typography Style Recommendations:", 11, true, 2);
            addText(`${typography}  (${designSettings?.style || "Clean Corporate Minimalist"})`, 10, 6);
        }
    }

    // ==========================================
    // STEP 8: Final Strategic Verdict / Conclusão
    // ==========================================
    addSectionHeader(t.blueprintStep.bottomLine || "Strategic Bottom Line", "8.");
    checkPageBreak(50);
    doc.setFillColor(30, 41, 59); // Dark blue summary box highlight
    doc.rect(margin, y, maxLineWidth, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    const bottomLineLines = doc.splitTextToSize(`"${blueprint.bottomLine}"`, maxLineWidth - 10);
    doc.text(bottomLineLines, margin + 5, y + 15);
    y += 45;

    // --- Footer page marker ---
    y += 10;
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    addText("End of Blueprint Dossier - Engineered by MarketHero Engine", 8.5, 0);

    const safeName = product.name.replace(/[^a-zA-Z0-9-_]/g, '_');
    doc.save(`${safeName}_Blueprint_Dossier.pdf`);
  };

  const handleExportJSON = () => {
    if (!product || !blueprint) return;

    // Clone and clean product data (remove large images for JSON export)
    const cleanProduct = JSON.parse(JSON.stringify(product));

    const removeImages = (obj: any) => {
        if (typeof obj !== 'object' || obj === null) return;
        if (Array.isArray(obj)) {
            for (let i = 0; i < obj.length; i++) removeImages(obj[i]);
            return;
        }
        Object.keys(obj).forEach(key => {
            const val = obj[key];
            if (['images', 'imageUrl', 'avatarUrl', 'avatarOptions', 'selectedBaseImage', 'referenceImages', 'inlineData'].includes(key)) {
                delete obj[key];
                return;
            } 
            if (typeof val === 'string' && val.startsWith('data:image')) {
                delete obj[key];
                return;
            }
            if (typeof val === 'object') removeImages(val);
        });
    };

    removeImages(cleanProduct);

    const exportData = {
        metadata: {
            generatedAt: new Date().toISOString(),
            version: "MarketHero Blueprint v1.0",
            language: language
        },
        blueprint: {
            summaries: product.launchBlueprint,
            core_data: cleanProduct
        }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${product.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_blueprint.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="w-full py-32 text-center animate-pulse">
        <Loader2 className="animate-spin text-indigo-600 mx-auto mb-8" size={60} />
        <h3 className="text-3xl font-display font-bold text-gray-900 mb-4">{t.blueprintStep.engineering}</h3>
        <p className="text-lg text-gray-500 max-w-md mx-auto italic">"Synthesizing all strategic pillars into a cohesive executive dossier."</p>
      </div>
    );
  }

  if (!blueprint) {
    return (
      <div className="animate-slide-up w-full">
        <h2 className="text-4xl font-display font-bold mb-3 tracking-tight text-gray-900">{t.blueprintStep.title}</h2>
        <p className="text-lg text-gray-500 mb-6">{t.blueprintStep.subtitle}</p>
        <div className="border-2 border-dashed rounded-[3rem] p-16 text-center transition-all group border-gray-200 bg-gray-50/50 hover:bg-gray-50">
            <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 text-indigo-600">
                <FileText size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t.blueprintStep.emptyTitle}</h3>
            <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">{t.blueprintStep.emptyDesc}</p>
            <button 
              onClick={onGenerate}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-indigo-200 transition-all flex items-center justify-center mx-auto hover:-translate-y-1 active:translate-y-0 shadow-lg group"
            >
              <Sparkles className="mr-3 group-hover:scale-110 transition-transform" size={20} />
              {t.blueprintStep.generateBtn}
            </button>
        </div>
      </div>
    );
  }

  const SummaryBlock = ({ title, summary, children, icon: Icon, colorClass = "text-indigo-600", bgClass = "bg-indigo-50" }: any) => (
    <div className="py-12 border-b border-gray-100 last:border-0 break-inside-avoid w-full print:py-6 print:border-black/10">
        <div className="flex items-center gap-4 mb-8 print:mb-4">
            <div className={`p-3 ${bgClass} ${colorClass} rounded-2xl shadow-sm print:shadow-none print:bg-transparent print:p-0 print:text-black`}>
                <Icon size={24} className="print:w-6 print:h-6" />
            </div>
            <h3 className="text-2xl font-display font-bold text-gray-900 tracking-tight print:text-xl print:uppercase">{title}</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-10 print:gap-6">
            {/* Executive Perspective */}
            {summary && (
                <div className="bg-slate-50 border-l-4 border-slate-300 p-8 rounded-r-3xl print:border-l-2 print:border-black print:bg-transparent print:p-0 print:pl-4 print:rounded-none">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2 print:text-black print:mb-1">
                        <Info size={12} /> {t.blueprintStep.execSummary}
                    </p>
                    <p className="text-lg text-slate-800 leading-relaxed font-serif italic print:text-sm print:not-italic print:text-black">
                        "{summary}"
                    </p>
                </div>
            )}

            {/* Operational Data */}
            <div className="w-full">
                {children}
            </div>
        </div>
    </div>
  );

  // Infer visual identity data
  const brandKit = product.designDirectorData?.brandKit || product.brandKit;
  const designSettings = product.designDirectorData?.settings || product.lpBuilderData?.copy?.designRecommendation;
  const colors = brandKit?.colors || (product.salesPage?.visualIdentity?.primaryColor ? [product.salesPage.visualIdentity.primaryColor, product.salesPage.visualIdentity.secondaryColor, product.salesPage.visualIdentity.backgroundColor] : []);
  const hasVisualData = colors.length > 0 || !!designSettings;

  const typographyDisplay = designSettings?.typography || (brandKit as any)?.fontHeadline || (brandKit as any)?.fontPairingRecommendation || "Sans-Serif Modern";
  const suggestionDisplay = (brandKit as any)?.suggestion || (brandKit as any)?.tone;

  const storyboards = product.storyboards || [];

  return (
    <div className="w-full pb-20 animate-fade-in print-container max-w-6xl mx-auto">
      <style>{`
        @media print {
          @page { margin: 1.5cm; size: A4; }
          
          body {
            background-color: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Hide everything by default */
          body * {
            visibility: hidden;
          }
          
          /* Only show content inside print-container */
          .print-container, .print-container * {
            visibility: visible;
          }

          .print-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background-color: white !important;
            z-index: 9999;
          }

          .no-print {
            display: none !important;
          }
          
          .blueprint-card { 
            border: none !important; 
            box-shadow: none !important; 
            border-radius: 0 !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            overflow: visible !important;
          }
          
          .page-break { page-break-after: always !important; }
          .break-inside-avoid { page-break-inside: avoid !important; }
          
          /* Hyper Minimalist Reset */
          h1, h2, h3, h4, h5, h6, p, span, div, li { 
            color: black !important; 
            text-shadow: none !important;
          }
          
          /* Flatten Backgrounds */
          [class*="bg-"] {
             background-color: white !important;
             color: black !important;
          }
          
          /* Borders instead of shadows */
          [class*="rounded-"] {
             border-radius: 0 !important;
             box-shadow: none !important;
          }
          
          /* Add borders to defined blocks for structure */
          .p-4, .p-6, .p-8, .p-10, .p-12 {
             border: 1px solid #000 !important;
             padding: 1rem !important;
             margin-bottom: 1rem !important;
          }
          
          /* Hide decorative elements */
          .absolute.blur-3xl, .absolute.opacity-30, .absolute.opacity-10, .absolute.opacity-5 {
             display: none !important;
          }

          /* Grid adjustments for print columns */
          .grid { display: grid !important; gap: 1rem !important; } 
          .md\\:grid-cols-2, .lg\\:grid-cols-2 { grid-template-columns: 1fr 1fr !important; }
          .md\\:grid-cols-3, .lg\\:grid-cols-3 { grid-template-columns: 1fr 1fr 1fr !important; }
          
          img { 
            max-width: 100% !important; 
            height: auto !important; 
            border: 1px solid #000 !important;
            filter: grayscale(100%); /* Minimalist BW images */
          }
          
          /* Force SVG icons to be black */
          svg { stroke: black !important; fill: none !important; }
        }
      `}</style>

      {/* Control Bar (Hidden in Print) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-6 no-print">
        <div>
          <h2 className="text-4xl font-display font-bold text-gray-900">{t.blueprintStep.title}</h2>
          <p className="text-lg text-gray-500 mt-2">{t.blueprintStep.subtitle}</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={onGenerate} 
            className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 flex items-center gap-2 transition-all"
          >
            <RefreshCw size={16} /> {t.common.refresh}
          </button>
          <button 
            onClick={handleExportJSON} 
            className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 flex items-center gap-2 transition-all"
          >
            <FileJson size={16} /> {t.common.downloadJson}
          </button>
          <button 
            onClick={handleExportPDF}
            className="px-8 py-3 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-black shadow-xl flex items-center gap-2 transition-all active:scale-95"
          >
            <Printer size={16} /> {t.blueprintStep.exportPdf}
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 shadow-[0_30px_100px_rgba(0,0,0,0.08)] rounded-[3rem] overflow-hidden blueprint-card">
        {/* Dossier Header */}
        <div className="p-12 md:p-24 bg-slate-900 text-white relative overflow-hidden print:p-0 print:mb-8 print:bg-white print:text-black print:border-b-2 print:border-black">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600 rounded-full blur-[150px] opacity-30 -mr-40 -mt-40 no-print"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-10 print:mb-4">
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shadow-xl print:hidden">
                        <Star className="text-indigo-400 fill-indigo-400" size={32} />
                    </div>
                    <div>
                        <span className="text-xs font-bold uppercase tracking-[0.4em] opacity-60 block print:text-black">{t.blueprintStep.confidential}</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 print:text-black">{t.blueprintStep.generatedOn} {new Date().toLocaleDateString()}</span>
                    </div>
                </div>
                <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tighter mb-8 leading-none print:text-4xl print:mb-4">
                    {product.name}<br/>
                    <span className="text-indigo-400 print:text-black">Blueprint</span>
                </h1>
                <div className="flex flex-wrap gap-6 mt-16 print:mt-4 print:gap-4">
                    <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/10 text-xs font-bold uppercase tracking-widest print:bg-white print:border-black print:text-black print:px-0 print:py-0 print:border-0">
                        <Globe size={16} className="text-indigo-400 print:text-black" /> {product.location}
                    </div>
                    <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/10 text-xs font-bold uppercase tracking-widest print:bg-white print:border-black print:text-black print:px-0 print:py-0 print:border-0">
                        <Target size={16} className="text-emerald-400 print:text-black" /> {product.goal}
                    </div>
                    <div className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/10 text-xs font-bold uppercase tracking-widest print:bg-white print:border-black print:text-black print:px-0 print:py-0 print:border-0">
                        <Users size={16} className="text-amber-400 print:text-black" /> {product.audienceType}
                    </div>
                </div>
            </div>
        </div>

        <div className="p-10 md:p-20 space-y-12 print:p-8 print:space-y-8">
            {/* 1. Strategic Summary (McKinsey Style) */}
            <SummaryBlock title={t.blueprintStep.execSummary} icon={Briefcase} colorClass="text-slate-600" bgClass="bg-slate-100">
                <div className="space-y-10 print:space-y-6">
                    <div className="bg-slate-50 border-l-4 border-indigo-500 p-8 rounded-r-3xl print:border-l-4 print:border-black print:pl-4 print:bg-white">
                        <p className="text-lg text-slate-800 leading-relaxed font-serif print:text-sm print:font-sans">
                            {blueprint.productSummary}
                        </p>
                    </div>

                    {blueprint.currentState && (
                        <div className="bg-white p-8 rounded-3xl border border-red-100 shadow-sm print:border-black print:rounded-none">
                            <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2 print:text-black">
                                <AlertTriangle size={14} /> {t.blueprintStep.currentState}
                            </h4>
                            <p className="text-base text-gray-700 font-medium italic print:not-italic print:text-black">"{blueprint.currentState}"</p>
                        </div>
                    )}

                    {blueprint.priorityInitiatives && (
                        <div>
                            <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2 print:text-black">
                                <Rocket size={14} /> {t.blueprintStep.priorityInitiatives}
                            </h4>
                            <div className="space-y-3">
                                {blueprint.priorityInitiatives.map((init, i) => (
                                    <div key={i} className="flex gap-4 items-center p-4 bg-emerald-50/30 rounded-xl border border-emerald-100/50 print:border-black print:bg-white print:rounded-none">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0 print:bg-black print:text-white">{i + 1}</div>
                                        <p className="text-slate-800 font-bold text-sm leading-tight print:text-black">{init}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:gap-4">
                        {blueprint.resourceRequirements && (
                            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm h-full print:border-black print:rounded-none">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 print:text-black">
                                    <Users size={14} /> {t.blueprintStep.resourceRequirements}
                                </h4>
                                <p className="text-sm text-gray-600 leading-relaxed font-medium print:text-black">{blueprint.resourceRequirements}</p>
                            </div>
                        )}
                        {blueprint.decisionFramework && (
                            <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm h-full print:border-black print:rounded-none">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 print:text-black">
                                    <Scale size={14} /> {t.blueprintStep.decisionFramework}
                                </h4>
                                <p className="text-sm text-gray-600 leading-relaxed font-medium print:text-black">{blueprint.decisionFramework}</p>
                            </div>
                        )}
                    </div>

                    {blueprint.oneHourBrief && (
                        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl flex items-start gap-4 print:bg-white print:text-black print:border-black print:border print:rounded-none">
                            <Clock size={24} className="text-indigo-400 shrink-0 mt-1 print:text-black" />
                            <div>
                                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2 print:text-black">{t.blueprintStep.oneHourBrief}</h4>
                                <p className="text-lg font-bold leading-relaxed print:text-sm">{blueprint.oneHourBrief}</p>
                            </div>
                        </div>
                    )}
                </div>
            </SummaryBlock>

            <div className="page-break" />

            {/* 2. Human Factor */}
            <SummaryBlock title={t.blueprintStep.buyerInsights} summary={blueprint.buyerSummary} icon={Users} colorClass="text-indigo-600" bgClass="bg-indigo-50">
                {product.dreamBuyer && (
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-12 shadow-sm print:border-0 print:p-0">
                        <div className="flex flex-col md:flex-row items-center gap-10 mb-12 print:mb-6">
                            {product.dreamBuyer.avatarUrl && <img src={product.dreamBuyer.avatarUrl} className="w-40 h-40 rounded-[2rem] object-cover shadow-2xl border-4 border-white ring-1 ring-indigo-100 print:w-24 print:h-24 print:border-black print:rounded-none print:shadow-none" />}
                            <div className="text-center md:text-left print:text-left">
                                <h4 className="text-4xl font-display font-bold text-gray-900 mb-2 print:text-xl">{product.dreamBuyer.name}</h4>
                                <div className="inline-flex items-center px-4 py-1.5 bg-indigo-600 text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-lg mb-4 print:bg-white print:text-black print:border print:border-black print:px-2 print:py-0 print:shadow-none">{product.dreamBuyer.archetype}</div>
                                <p className="text-lg text-gray-500 font-medium print:text-sm print:text-black">{product.dreamBuyer.occupation} • {product.dreamBuyer.ageRange}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:gap-4">
                            <div className="p-8 bg-red-50 rounded-3xl border border-red-100 print:bg-white print:border-black print:rounded-none">
                                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-4 print:text-black">{t.blueprintStep.burningPain}</p>
                                <p className="text-red-950 font-bold leading-relaxed italic print:text-black print:not-italic">"{product.dreamBuyer.painPoint}"</p>
                            </div>
                            <div className="p-8 bg-emerald-50 rounded-3xl border border-emerald-100 print:bg-white print:border-black print:rounded-none">
                                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-4 print:text-black">{t.blueprintStep.deepestDesire}</p>
                                <p className="text-emerald-950 font-bold leading-relaxed italic print:text-black print:not-italic">"{product.dreamBuyer.desire}"</p>
                            </div>
                            <div className="p-8 bg-amber-50 rounded-3xl border border-amber-100 print:bg-white print:border-black print:rounded-none">
                                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-4 print:text-black">{t.blueprintStep.barrierObjection}</p>
                                <p className="text-amber-950 font-bold leading-relaxed italic print:text-black print:not-italic">"{product.dreamBuyer.objection}"</p>
                            </div>
                        </div>
                        
                        {product.dreamBuyer.mediaConsumption && (
                            <div className="mt-6 p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100/50 flex items-start gap-3 print:bg-white print:border-black print:rounded-none">
                                <Monitor size={18} className="text-indigo-500 mt-0.5 shrink-0 print:text-black" />
                                <div>
                                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1 print:text-black">{t.dreamBuyerStep.mediaConsumption}</p>
                                    <p className="text-sm font-medium text-slate-700 leading-relaxed print:text-black">{product.dreamBuyer.mediaConsumption}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </SummaryBlock>

            <div className="page-break" />

            {/* 3. Market Landscape */}
            <SummaryBlock title={t.blueprintStep.marketLandscape} summary={blueprint.marketSummary} icon={BarChart} colorClass="text-emerald-600" bgClass="bg-emerald-50">
                {product.marketIntel && (
                    <div className="space-y-12 print:space-y-6">
                        {/* 3.1 Market Patterns */}
                        {(product.marketIntel.workingNow.length > 0 || product.marketIntel.saturated.length > 0 || product.marketIntel.opportunities.length > 0) && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:gap-4">
                                <div className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100 print:bg-white print:border-black print:rounded-none">
                                    <h5 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2 print:text-black">
                                        <TrendingUp size={14} /> {t.marketIntelStep.winningPatterns}
                                    </h5>
                                    <ul className="space-y-2">
                                        {product.marketIntel.workingNow.map((item, i) => (
                                            <li key={i} className="text-sm text-slate-700 leading-snug flex items-start gap-2 print:text-black">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0 print:bg-black" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="p-6 bg-red-50/50 rounded-2xl border border-red-100 print:bg-white print:border-black print:rounded-none">
                                    <h5 className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2 print:text-black">
                                        <AlertTriangle size={14} /> {t.marketIntelStep.saturatedAngles}
                                    </h5>
                                    <ul className="space-y-2">
                                        {product.marketIntel.saturated.map((item, i) => (
                                            <li key={i} className="text-sm text-slate-700 leading-snug flex items-start gap-2 print:text-black">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0 print:bg-black" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 print:bg-white print:border-black print:rounded-none">
                                    <h5 className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-4 flex items-center gap-2 print:text-black">
                                        <Zap size={14} /> {t.marketIntelStep.gapOpportunities}
                                    </h5>
                                    <ul className="space-y-2">
                                        {product.marketIntel.opportunities.map((item, i) => (
                                            <li key={i} className="text-sm text-slate-700 leading-snug flex items-start gap-2 print:text-black">
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0 print:bg-black" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* 3.4 Pricing and Competitors */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 print:gap-4">
                            {product.marketIntel.pricingSuggestions && (
                                <div className="space-y-6">
                                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 print:text-black"><DollarSign size={14}/> {t.blueprintStep.yieldStrategy}</h5>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="p-8 bg-white border border-emerald-100 rounded-3xl shadow-sm print:border-black print:rounded-none">
                                            <p className="text-[10px] font-bold text-emerald-600 uppercase mb-2 print:text-black">{t.blueprintStep.disruptivePricing}</p>
                                            <p className="text-3xl font-display font-bold text-gray-900 mb-2 print:text-xl">{product.marketIntel.pricingSuggestions.sameForLess.price}</p>
                                            <p className="text-sm text-gray-500 italic leading-relaxed print:text-black print:not-italic">{product.marketIntel.pricingSuggestions.sameForLess.logic}</p>
                                        </div>
                                        <div className="p-8 bg-indigo-900 text-white rounded-3xl shadow-xl print:bg-white print:text-black print:border-black print:border print:rounded-none">
                                            <p className="text-[10px] font-bold text-indigo-300 uppercase mb-2 print:text-black">{t.blueprintStep.marketLeader}</p>
                                            <p className="text-3xl font-display font-bold mb-2 print:text-xl">{product.marketIntel.pricingSuggestions.moreForSame.price}</p>
                                            <p className="text-sm opacity-60 italic leading-relaxed print:opacity-100 print:text-black print:not-italic">{product.marketIntel.pricingSuggestions.moreForSame.logic}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="space-y-6">
                                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 print:text-black"><Globe size={14}/> {t.blueprintStep.competitiveRadar}</h5>
                                <div className="space-y-4">
                                    {product.marketIntel.competitors?.slice(0, 3).map((comp, i) => (
                                        <div key={i} className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-4 print:bg-white print:border-black print:rounded-none">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-bold text-slate-900 text-lg print:text-base">{comp.name}</p>
                                                    <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-400 shadow-sm inline-block mt-1 print:text-black print:border-black">{comp.pricePoint}</span>
                                                </div>
                                                {comp.rating && (
                                                    <div className="flex items-center gap-1 text-amber-500 font-bold text-xs print:text-black">
                                                        <Star size={12} fill="currentColor" /> {comp.rating}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200/60 print:border-black">
                                                <div>
                                                    <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider mb-1 flex items-center gap-1 print:text-black"><CheckCircle size={10} /> Strength</p>
                                                    <p className="text-xs text-slate-600 leading-snug print:text-black">{comp.strength}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-bold text-red-500 uppercase tracking-wider mb-1 flex items-center gap-1 print:text-black"><XCircle size={10} /> Weakness</p>
                                                    <p className="text-xs text-slate-600 leading-snug print:text-black">{comp.weakness}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </SummaryBlock>

            <div className="page-break" />

            {/* 4. Offer Architecture */}
            <SummaryBlock title={t.blueprintStep.offerArchitecture} summary={blueprint.offerSummary} icon={Gift} colorClass="text-amber-600" bgClass="bg-amber-50">
                {product.offer && (
                    <div className="bg-amber-50 rounded-[3rem] border border-amber-200 p-12 text-center overflow-hidden relative print:bg-white print:border-black print:rounded-none print:p-4">
                        <div className="absolute -top-10 -right-10 p-4 opacity-5 no-print"><Gift size={200} /></div>
                        <div className="relative z-10">
                            <p className="text-xs font-bold uppercase tracking-[0.4em] text-amber-500 mb-6 print:text-black">{t.blueprintStep.highConvPromise}</p>
                            <h4 className="text-4xl md:text-6xl font-display font-bold text-amber-950 italic leading-none mb-12 print:text-2xl print:mb-6 print:not-italic print:text-black">"{product.offer.headline}"</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left print:gap-4">
                                <div className="p-8 bg-white/60 backdrop-blur-md rounded-3xl border border-amber-100 print:bg-white print:border-black print:rounded-none">
                                    <div className="flex items-center gap-3 mb-6 print:mb-2">
                                        <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg print:hidden"><Zap size={18} /></div>
                                        <h5 className="font-bold text-amber-950 uppercase tracking-widest text-sm print:text-black">{t.blueprintStep.uniqueMechanism}</h5>
                                    </div>
                                    <p className="text-amber-900 font-bold text-xl leading-snug print:text-base print:text-black">{product.bigIdea?.uniqueMechanism}</p>
                                </div>
                                <div className="p-8 bg-white/60 backdrop-blur-md rounded-3xl border border-amber-100 print:bg-white print:border-black print:rounded-none">
                                    <div className="flex items-center gap-3 mb-6 print:mb-2">
                                        <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-lg print:hidden"><Shield size={18} /></div>
                                        <h5 className="font-bold text-amber-950 uppercase tracking-widest text-sm print:text-black">{t.blueprintStep.successGuarantee}</h5>
                                    </div>
                                    <p className="text-amber-900 font-bold text-xl leading-snug print:text-base print:text-black">{product.offer.riskReversal}</p>
                                </div>
                            </div>

                            <div className="mt-12 flex flex-wrap justify-center gap-3 print:mt-6">
                                {product.offer.bonuses.map((b, i) => (
                                    <div key={i} className="px-6 py-3 bg-indigo-900 text-white rounded-2xl text-xs font-bold shadow-xl border border-white/10 uppercase tracking-widest print:bg-white print:text-black print:border-black print:border print:rounded-none print:shadow-none">
                                        + {b.title} <span className="opacity-40 mx-2 print:opacity-100">|</span> {b.value}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </SummaryBlock>

            <div className="page-break" />

            {/* 5. Execution Sequence */}
            <SummaryBlock title={t.blueprintStep.growthSequence} summary={blueprint.planSummary} icon={Target} colorClass="text-indigo-600" bgClass="bg-indigo-50">
                {product.campaignPlan && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 print:grid-cols-1 print:gap-6">
                        <div className="lg:col-span-4 space-y-6">
                            <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-2xl print:bg-white print:text-black print:border-black print:border print:rounded-none print:p-4">
                                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-6 print:text-black">{t.blueprintStep.operationalStack}</p>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center border-b border-white/10 pb-4 print:border-black">
                                        <span className="text-xs font-bold opacity-40 print:opacity-100">{t.blueprintStep.primaryHub}</span>
                                        <span className="text-sm font-bold">{product.campaignPlan.channelSetup.platform}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-white/10 pb-4 print:border-black">
                                        <span className="text-xs font-bold opacity-40 print:opacity-100">{t.blueprintStep.dailyBudget}</span>
                                        <span className="text-sm font-bold text-indigo-400 print:text-black">{product.campaignPlan.channelSetup.budgetRange}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold opacity-40 print:opacity-100">{t.blueprintStep.duration}</span>
                                        <span className="text-sm font-bold">{product.campaignPlan.channelSetup.testDuration}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 bg-fuchsia-100 rounded-[2.5rem] border border-fuchsia-200 print:bg-white print:border-black print:rounded-none print:p-4">
                                <div className="flex items-center gap-2 mb-4 text-fuchsia-600 font-bold uppercase tracking-widest text-[10px] print:text-black"><Zap size={14} className="fill-fuchsia-600 print:fill-black"/> {t.blueprintStep.growthCatalyst}</div>
                                <p className="text-fuchsia-900 font-bold italic leading-relaxed print:text-black print:not-italic">"{product.campaignPlan.viralInitiative}"</p>
                            </div>
                        </div>
                        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm print:border-black print:rounded-none print:p-4">
                            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em] mb-8 print:text-black">{t.blueprintStep.stepTrajectory}</h5>
                            <div className="space-y-4">
                                {product.campaignPlan.launchSteps.map((step, i) => (
                                    <div key={i} className="flex gap-6 items-start p-6 bg-slate-50 rounded-2xl transition-all print:bg-white print:border-black print:border print:rounded-none print:p-3">
                                        <span className="w-10 h-10 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-lg print:bg-black print:w-6 print:h-6">{i+1}</span>
                                        <p className="text-slate-800 font-bold leading-relaxed print:text-black">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </SummaryBlock>

            {/* 6. Creative Direction */}
            <SummaryBlock title={t.blueprintStep.creativeDirection} summary={blueprint.creativeSummary} icon={Clapperboard} colorClass="text-purple-600" bgClass="bg-purple-50">
                <div className="space-y-12 print:space-y-6">
                    {/* Visual Ads Map */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {product.creatives.slice(0, 4).map((c, i) => (
                            <div key={i} className="group relative aspect-square rounded-[2rem] overflow-hidden shadow-xl border border-white print:border-black print:rounded-none print:shadow-none">
                                {c.imageUrl ? (
                                    <img src={c.imageUrl} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" />
                                ) : (
                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center print:bg-white"><Clapperboard className="text-slate-300 print:text-black" /></div>
                                )}
                                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent print:bg-white print:border-t print:border-black">
                                    <p className="text-[8px] font-bold text-white uppercase tracking-widest print:text-black">{c.style}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Content Strategy Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:gap-4">
                        {product.emailCampaign && (
                            <div className="p-8 bg-slate-900 text-white rounded-[3rem] shadow-2xl relative overflow-hidden group print:bg-white print:text-black print:border-black print:border print:rounded-none print:p-4">
                                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform no-print"><Mail size={120} /></div>
                                <div className="relative z-10">
                                    <h5 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-6 flex items-center gap-2 print:text-black"><Inbox size={14}/> {t.blueprintStep.crmChain}</h5>
                                    <p className="text-lg font-bold mb-6 italic print:not-italic print:text-black">"{product.emailCampaign.category}" Sequence</p>
                                    <div className="space-y-3">
                                        {product.emailCampaign.emails.slice(0, 3).map((e, i) => (
                                            <div key={i} className="flex gap-4 items-center opacity-60 print:opacity-100">
                                                <div className="w-2 h-2 rounded-full bg-indigo-400 print:bg-black"></div>
                                                <p className="text-xs font-medium truncate print:text-black">{e.subject}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        {storyboards.length > 0 && (
                            <div className="p-8 bg-white border border-slate-100 rounded-[3rem] shadow-sm print:border-black print:rounded-none print:p-4">
                                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 print:text-black"><Video size={14}/> {t.blueprintStep.videoArchitecture}</h5>
                                <p className="text-slate-900 font-bold text-lg mb-6 leading-tight print:text-black">"{storyboards[0].title}"</p>
                                <div className="space-y-4">
                                    {storyboards[0].scenes.slice(0, 3).map((s, i) => (
                                        <div key={i} className="flex gap-4 items-center">
                                            <span className="text-[10px] font-bold text-slate-300 print:text-black">S.0{s.number}</span>
                                            <div className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase text-white shrink-0 ${s.energyTag === 'Hook' ? 'bg-indigo-600' : 'bg-slate-400'} print:bg-white print:text-black print:border print:border-black`}>{s.energyTag}</div>
                                            <p className="text-[10px] font-bold text-slate-600 truncate print:text-black">{s.onScreenText}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </SummaryBlock>

            <div className="page-break" />

            {/* New Section: Visual Brand DNA */}
            {(hasVisualData) && (
              <SummaryBlock title={t.blueprintStep.visualDna || "Visual Brand DNA"} icon={Palette} colorClass="text-purple-500" bgClass="bg-purple-50">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:gap-4">
                    <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm print:border-black print:rounded-none print:p-4">
                        <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2 print:text-black">
                           <Palette size={12} /> {t.blueprintStep.colorPalette || "Color Palette"}
                        </h5>
                        <div className="flex flex-wrap gap-4">
                           {colors.map((color, idx) => (
                              <div key={idx} className="flex flex-col items-center gap-2">
                                 <div className="w-16 h-16 rounded-2xl shadow-sm border border-gray-100 print:border-black print:rounded-none" style={{ backgroundColor: color }}></div>
                                 <span className="text-[10px] font-mono text-gray-500 font-medium print:text-black">{color}</span>
                              </div>
                           ))}
                           {colors.length === 0 && <p className="text-sm text-gray-400 italic">No colors defined yet.</p>}
                        </div>
                    </div>
                    <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm print:border-black print:rounded-none print:p-4">
                        <div className="mb-8">
                           <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2 print:text-black">
                              <Layout size={12} /> {t.blueprintStep.aestheticStyle || "Aesthetic Direction"}
                           </h5>
                           <p className="text-lg font-bold text-gray-900 print:text-black">{designSettings?.style || "Modern Minimalist"}</p>
                           {designSettings?.visualIntensity && <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full uppercase print:bg-white print:text-black print:border print:border-black">{designSettings.visualIntensity}</span>}
                        </div>
                        <div>
                           <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2 print:text-black">
                              <FileText size={12} /> {t.blueprintStep.typographySystem || "Typography"}
                           </h5>
                           <p className="text-sm font-medium text-gray-700 print:text-black">{typographyDisplay}</p>
                        </div>
                    </div>
                 </div>
                 {suggestionDisplay && (
                    <div className="mt-8 p-6 bg-purple-50/50 rounded-2xl border border-purple-100 print:bg-white print:border-black print:rounded-none print:p-4">
                        <p className="text-sm text-purple-900 italic font-medium leading-relaxed print:text-black print:not-italic">
                           "{suggestionDisplay}"
                        </p>
                    </div>
                 )}
              </SummaryBlock>
            )}

            <div className="page-break" />

            {/* Final Verdict Section */}
            <div className="pt-20 break-inside-avoid print:pt-4">
                <section className="p-12 md:p-24 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-[3rem] text-center relative overflow-hidden shadow-2xl print:bg-white print:text-black print:border-black print:border-2 print:rounded-none print:p-8 print:shadow-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 no-print"></div>
                    <div className="relative z-10 max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] mb-8 border border-white/10 print:bg-white print:text-black print:border-black print:border">
                            <ShieldCheck size={12} className="text-emerald-400 print:text-black" /> {t.blueprintStep.approved}
                        </div>
                        <h3 className="text-2xl md:text-3xl font-display font-bold mb-8 leading-tight text-white/90 print:text-black">"{blueprint.bottomLine}"</h3>
                        
                        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent mx-auto mb-8 print:bg-black"></div>
                        
                        <div className="flex justify-center items-center gap-8 opacity-60 print:opacity-100">
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] uppercase tracking-widest mb-1 print:text-black">{t.blueprintStep.strategicAsset}</span>
                                <span className="font-display font-bold print:text-black">{t.blueprintStep.dossierVersion}</span>
                            </div>
                        </div>
                    </div>
                </section>
                
                <div className="mt-12 text-center opacity-30 print:opacity-100">
                    <p className="text-[10px] font-bold uppercase tracking-[0.5em] flex items-center justify-center gap-2 print:text-black">
                        <Zap size={10} className="print:hidden"/> {t.blueprintStep.engineCore}
                    </p>
                </div>
            </div>
        </div>
    </div>
    </div>
  );
};
