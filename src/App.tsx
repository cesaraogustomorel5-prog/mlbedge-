import { useState, useRef, useEffect, memo } from "react";

// DESIGN
const DK={bg0:"#0a0e1a",bg1:"#111827",bg2:"#1a2234",gl:"rgba(255,255,255,0.04)",gb:"rgba(255,255,255,0.08)",tx:"#f9fafb",sb:"#9ca3af",mt:"#4b5563",ind:"#6366f1",il:"#818cf8",gr:"#10b981",am:"#f59e0b",rd:"#ef4444",vi:"#8b5cf6"};
const LT={bg0:"#f0f4f8",bg1:"#ffffff",bg2:"#e8edf5",gl:"rgba(0,0,0,0.03)",gb:"rgba(0,0,0,0.1)",tx:"#111827",sb:"#4b5563",mt:"#9ca3af",ind:"#4f46e5",il:"#6366f1",gr:"#059669",am:"#d97706",rd:"#dc2626",vi:"#7c3aed"};
const GC={A:"#10b981",B:"#6366f1",C:"#f59e0b",D:"#ef4444"};
const LANGS={es:{f:"🇪🇸",n:"Español"},en:{f:"🇺🇸",n:"English"},pt:{f:"🇧🇷",n:"Português"},fr:{f:"🇫🇷",n:"Français"},it:{f:"🇮🇹",n:"Italiano"},de:{f:"🇩🇪",n:"Deutsch"},ja:{f:"🇯🇵",n:"日本語"},ko:{f:"🇰🇷",n:"한국어"},zh:{f:"🇨🇳",n:"中文"}};
const TX={
  es:{tag:"Análisis MLB profesional",cal:"Calendario",opp:"Oportunidades",sts:"Estadísticas",prf:"Perfil",cfg:"Configuración",lv:"En Vivo",fn:"Final",hm:"Local",aw:"Visitante",ml:"Moneyline",rl:"Run Line",ou:"Over/Under",cf:"Confianza",eg:"Ventaja",rk:"Riesgo",lo:"Bajo",md:"Medio",hi:"Alto",pj:"Proyección",wp:"Prob. Victoria",an:"Análisis",bk:"← Atrás",mr:"Ver Análisis →",lg:"Idioma",th:"Tema",dm:"Oscuro",lm:"Claro",lo2:"Cerrar sesión",mp:"Mi Plan",ap:"Ver planes",tr:"3 días gratis",aq:"Pregunta a Axe...",ao:"Axe · En línea",nt:"Notificaciones",ra:"Leer todas",fb:"Sugerencias",snd:"Enviar",sg:"Enviando...",tk:"¡Gracias!",fs:"Tu sugerencia fue recibida.",ld:"Datos en vivo",dd:"Demo",ll:"Cargando...",ng:"Sin partidos",ep:"Email",pp:"Contraseña (mín. 6)",si:"Iniciar sesión",su:"Crear cuenta gratis",ph:"+1 (809) 000-0000",ss:"Enviar SMS",vf:"Verificar código",cn:"← Cambiar número",cs:"SMS enviado.",gb2:"Continuar con Google",eb:"Continuar con Email",pb:"Continuar con Teléfono",gb3:"Explorar sin cuenta →",tm2:"Al registrarte aceptas nuestros Términos · Solo informativo · +21",eE:"Email o contraseña incorrectos.",eP:"Error al enviar SMS.",eO:"Código incorrecto.",eN:"Sin conexión.",eF:"Completa todos los campos.",ePw:"Mínimo 6 caracteres.",cE:"¡Cuenta creada! Revisa tu email.",cp:"Elige tu plan",pm:"/mes",cu:"Plan Actual",ac:"ACTIVO",sf:"Comenzar Gratis →",cp2:"Elegir Pro →",cp3:"Elegir Premium →",fq:"Preguntas frecuentes",q1:"¿Puedo cambiar de plan?",a1:"Sí, en cualquier momento.",q2:"¿Hay prueba gratis?",a2:"Todos los planes tienen 3 días gratis.",q3:"¿Se renueva automáticamente?",a3:"Sí, mensualmente. Cancela cuando quieras.",W:"G",LL:"P",PC:"PCG",sk:"Racha",l10:"Últ.10",pt:"Pitcheo",of:"Ofensiva",sd:"Posiciones",mc:"Monte Carlo",by_:"Bayesiano",sg2:"Sugerencia",bg:"Error",ft:"Función",cm:"Comentario",rt:"Calificación",ds:"Describe tu",today:"Hoy",upcoming:"Proximos",finished:"Finalizados",allGames:"Todos",noGames2:"Sin partidos",noGamesDesc:"No hay juegos",months:"Ene,Feb,Mar,Abr,May,Jun,Jul,Ago,Sep,Oct,Nov,Dic",wdays:"Dom,Lun,Mar,Mie,Jue,Vie,Sab",saveBtn:"Guardar cambios",savedMsg:"Guardado",unsaved:"Cambios sin guardar",closeAcc:"Cerrar sesion",cancelBtn:"Cancelar",confirmLogoutQ:"Cerrar sesion?",confirmLogoutMsg:"Necesitaras iniciar sesion de nuevo con Google.",jan:"Enero",feb:"Febrero",mar:"Marzo",apr:"Abril",may2:"Mayo",jun:"Junio",jul:"Julio",aug:"Agosto",sep:"Septiembre",oct:"Octubre",nov:"Noviembre",dec:"Diciembre"},
  en:{tag:"Professional MLB Analytics",cal:"Schedule",opp:"Opportunities",sts:"Stats",prf:"Profile",cfg:"Settings",lv:"Live",fn:"Final",hm:"Home",aw:"Away",ml:"Moneyline",rl:"Run Line",ou:"Over/Under",cf:"Confidence",eg:"Edge",rk:"Risk",lo:"Low",md:"Medium",hi:"High",pj:"Projection",wp:"Win Probability",an:"Analysis",bk:"← Back",mr:"See Analysis →",lg:"Language",th:"Theme",dm:"Dark",lm:"Light",lo2:"Sign out",mp:"My Plan",ap:"See plans",tr:"3 days free",aq:"Ask Axe...",ao:"Axe · Online",nt:"Notifications",ra:"Mark all read",fb:"Feedback",snd:"Send",sg:"Sending...",tk:"Thank you!",fs:"Feedback received.",ld:"Live data",dd:"Demo",ll:"Loading...",ng:"No games",ep:"Email",pp:"Password (min. 6)",si:"Sign in",su:"Create free account",ph:"+1 (809) 000-0000",ss:"Send SMS",vf:"Verify code",cn:"← Change number",cs:"SMS sent.",gb2:"Continue with Google",eb:"Continue with Email",pb:"Continue with Phone",gb3:"Explore without account →",tm2:"By signing up you agree to our Terms · 21+",eE:"Incorrect email or password.",eP:"Error sending SMS.",eO:"Incorrect code.",eN:"No connection.",eF:"Fill in all fields.",ePw:"Min 6 characters.",cE:"Account created! Check your email.",cp:"Choose your plan",pm:"/month",cu:"Current Plan",ac:"ACTIVE",sf:"Get Started Free →",cp2:"Choose Pro →",cp3:"Choose Premium →",fq:"FAQ",q1:"Can I change plans?",a1:"Yes, at any time.",q2:"Free trial?",a2:"All plans have 3 days free.",q3:"Auto-renewal?",a3:"Yes, monthly. Cancel anytime.",W:"W",LL:"L",PC:"PCT",sk:"Streak",l10:"Last 10",pt:"Pitching",of:"Offense",sd:"Standings",mc:"Monte Carlo",by_:"Bayesian",sg2:"Suggestion",bg:"Bug",ft:"Feature",cm:"Comment",rt:"Rating",ds:"Describe your",today:"Today",upcoming:"Upcoming",finished:"Finished",allGames:"All",noGames2:"No games",noGamesDesc:"No games for this selection",months:"Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec",wdays:"Sun,Mon,Tue,Wed,Thu,Fri,Sat",saveBtn:"Save changes",savedMsg:"Saved",unsaved:"Unsaved changes",closeAcc:"Sign out",cancelBtn:"Cancel",confirmLogoutQ:"Sign out?",confirmLogoutMsg:"You will need to sign in again with Google.",jan:"January",feb:"February",mar:"March",apr:"April",may2:"May",jun:"June",jul:"July",aug:"August",sep:"September",oct:"October",nov:"November",dec:"December"},
  pt:{tag:"Análise profissional MLB",cal:"Calendário",opp:"Oportunidades",sts:"Estatísticas",prf:"Perfil",cfg:"Configurações",lv:"Ao Vivo",fn:"Final",hm:"Casa",aw:"Visitante",ml:"Moneyline",rl:"Run Line",ou:"Over/Under",cf:"Confiança",eg:"Vantagem",rk:"Risco",lo:"Baixo",md:"Médio",hi:"Alto",pj:"Projeção",wp:"Prob. Vitória",an:"Análise",bk:"← Voltar",mr:"Ver Análise →",lg:"Idioma",th:"Tema",dm:"Escuro",lm:"Claro",lo2:"Sair",mp:"Meu Plano",ap:"Ver planos",tr:"3 dias grátis",aq:"Pergunte ao Axe...",ao:"Axe · Online",nt:"Notificações",ra:"Marcar todas",fb:"Sugestões",snd:"Enviar",sg:"Enviando...",tk:"Obrigado!",fs:"Sugestão recebida.",ld:"Dados ao vivo",dd:"Demo",ll:"Carregando...",ng:"Sem jogos",ep:"Email",pp:"Senha (mín. 6)",si:"Entrar",su:"Criar conta grátis",ph:"+55 (11) 90000-0000",ss:"Enviar SMS",vf:"Verificar código",cn:"← Mudar número",cs:"SMS enviado.",gb2:"Google",eb:"Email",pb:"Telefone",gb3:"Sem conta →",tm2:"Termos · +21",eE:"Email ou senha incorretos.",eP:"Erro SMS.",eO:"Código incorreto.",eN:"Sem conexão.",eF:"Preencha tudo.",ePw:"Mín 6 caracteres.",cE:"Conta criada!",cp:"Escolha seu plano",pm:"/mês",cu:"Plano Atual",ac:"ATIVO",sf:"Começar Grátis →",cp2:"Escolher Pro →",cp3:"Escolher Premium →",fq:"FAQ",q1:"Posso mudar de plano?",a1:"Sim.",q2:"Teste grátis?",a2:"3 dias.",q3:"Renovação auto?",a3:"Sim.",W:"V",LL:"D",PC:"PCT",sk:"Série",l10:"Últ.10",pt:"Arremesso",of:"Ataque",sd:"Tabela",mc:"Monte Carlo",by_:"Bayesiano",sg2:"Sugestão",bg:"Erro",ft:"Função",cm:"Comentário",rt:"Avaliação",ds:"Descreva sua",today:"Hoje",upcoming:"Proximos",finished:"Finalizados",allGames:"Todos",noGames2:"Sem jogos",noGamesDesc:"Sem jogos para esta selecao",months:"Jan,Fev,Mar,Abr,Mai,Jun,Jul,Ago,Set,Out,Nov,Dez",wdays:"Dom,Seg,Ter,Qua,Qui,Sex,Sab",saveBtn:"Salvar",savedMsg:"Salvo",unsaved:"Nao salvo",closeAcc:"Sair",cancelBtn:"Cancelar",confirmLogoutQ:"Sair?",confirmLogoutMsg:"Voce precisara entrar novamente.",jan:"Janeiro",feb:"Fevereiro",mar:"Marco",apr:"Abril",may2:"Maio",jun:"Junho",jul:"Julho",aug:"Agosto",sep:"Setembro",oct:"Outubro",nov:"Novembro",dec:"Dezembro"},
  fr:{tag:"Analyse MLB pro",cal:"Calendrier",opp:"Opportunités",sts:"Stats",prf:"Profil",cfg:"Paramètres",lv:"En Direct",fn:"Final",hm:"Domicile",aw:"Visiteur",ml:"Moneyline",rl:"Run Line",ou:"Over/Under",cf:"Confiance",eg:"Avantage",rk:"Risque",lo:"Faible",md:"Moyen",hi:"Élevé",pj:"Projection",wp:"Prob. Victoire",an:"Analyse",bk:"← Retour",mr:"Voir →",lg:"Langue",th:"Thème",dm:"Sombre",lm:"Clair",lo2:"Déconnexion",mp:"Mon Plan",ap:"Voir plans",tr:"3 jours gratuits",aq:"Demandez à Axe...",ao:"Axe · En ligne",nt:"Notifications",ra:"Tout lire",fb:"Suggestions",snd:"Envoyer",sg:"Envoi...",tk:"Merci!",fs:"Suggestion reçue.",ld:"Live",dd:"Démo",ll:"Chargement...",ng:"Pas de matchs",ep:"Email",pp:"Mot de passe (min. 6)",si:"Connexion",su:"Créer compte",ph:"+33 6 00 00 00 00",ss:"SMS",vf:"Vérifier",cn:"← Changer",cs:"SMS envoyé.",gb2:"Google",eb:"Email",pb:"Téléphone",gb3:"Invité →",tm2:"CGU · +21",eE:"Email/mdp incorrect.",eP:"Erreur SMS.",eO:"Code incorrect.",eN:"Pas de connexion.",eF:"Remplissez tout.",ePw:"Min 6 caractères.",cE:"Compte créé!",cp:"Choisissez plan",pm:"/mois",cu:"Plan Actuel",ac:"ACTIF",sf:"Gratuit →",cp2:"Pro →",cp3:"Premium →",fq:"FAQ",q1:"Changer de plan?",a1:"Oui.",q2:"Essai gratuit?",a2:"3 jours.",q3:"Renouvellement?",a3:"Oui.",W:"V",LL:"D",PC:"PCT",sk:"Série",l10:"10 Dern.",pt:"Lancer",of:"Offensive",sd:"Classement",mc:"Monte Carlo",by_:"Bayésien",sg2:"Suggestion",bg:"Bug",ft:"Fonction",cm:"Commentaire",rt:"Note",ds:"Décrivez",today:"Aujourd'hui",upcoming:"Prochains",finished:"Termines",allGames:"Tous",noGames2:"Pas de matchs",noGamesDesc:"Aucun match pour cette selection",months:"Jan,Fev,Mar,Avr,Mai,Jui,Jul,Aou,Sep,Oct,Nov,Dec",wdays:"Dim,Lun,Mar,Mer,Jeu,Ven,Sam",saveBtn:"Sauvegarder",savedMsg:"Sauvegarde",unsaved:"Non sauvegarde",closeAcc:"Deconnexion",cancelBtn:"Annuler",confirmLogoutQ:"Se deconnecter?",confirmLogoutMsg:"Vous devrez vous reconnecter avec Google.",jan:"Janvier",feb:"Fevrier",mar:"Mars",apr:"Avril",may2:"Mai",jun:"Juin",jul:"Juillet",aug:"Aout",sep:"Septembre",oct:"Octobre",nov:"Novembre",dec:"Decembre"},
  it:{tag:"Analisi MLB pro",cal:"Calendario",opp:"Opportunità",sts:"Statistiche",prf:"Profilo",cfg:"Impostazioni",lv:"In Diretta",fn:"Finale",hm:"Casa",aw:"Ospite",ml:"Moneyline",rl:"Run Line",ou:"Over/Under",cf:"Confidenza",eg:"Vantaggio",rk:"Rischio",lo:"Basso",md:"Medio",hi:"Alto",pj:"Proiezione",wp:"Prob. Vittoria",an:"Analisi",bk:"← Indietro",mr:"Vedi →",lg:"Lingua",th:"Tema",dm:"Scuro",lm:"Chiaro",lo2:"Esci",mp:"Piano",ap:"Piani",tr:"3 giorni gratis",aq:"Chiedi ad Axe...",ao:"Axe · Online",nt:"Notifiche",ra:"Segna tutto",fb:"Suggerimenti",snd:"Invia",sg:"Invio...",tk:"Grazie!",fs:"Suggerimento ricevuto.",ld:"Live",dd:"Demo",ll:"Caricamento...",ng:"Nessuna partita",ep:"Email",pp:"Password (min. 6)",si:"Accedi",su:"Registrati",ph:"+39 3 000 0000",ss:"SMS",vf:"Verifica",cn:"← Cambia",cs:"SMS inviato.",gb2:"Google",eb:"Email",pb:"Telefono",gb3:"Ospite →",tm2:"Termini · +21",eE:"Email/password errati.",eP:"Errore SMS.",eO:"Codice errato.",eN:"Nessuna connessione.",eF:"Compila tutto.",ePw:"Min 6 caratteri.",cE:"Account creato!",cp:"Scegli piano",pm:"/mese",cu:"Piano Attuale",ac:"ATTIVO",sf:"Gratis →",cp2:"Pro →",cp3:"Premium →",fq:"FAQ",q1:"Cambiare piano?",a1:"Sì.",q2:"Prova gratuita?",a2:"3 giorni.",q3:"Rinnovo auto?",a3:"Sì.",W:"V",LL:"S",PC:"PCT",sk:"Serie",l10:"Ult.10",pt:"Lancio",of:"Attacco",sd:"Classifica",mc:"Monte Carlo",by_:"Bayesiano",sg2:"Suggerimento",bg:"Bug",ft:"Funzione",cm:"Commento",rt:"Voto",ds:"Descrivi",today:"Oggi",upcoming:"Prossimi",finished:"Terminati",allGames:"Tutti",noGames2:"Nessuna partita",noGamesDesc:"Nessun gioco per questa selezione",months:"Gen,Feb,Mar,Apr,Mag,Giu,Lug,Ago,Set,Ott,Nov,Dic",wdays:"Dom,Lun,Mar,Mer,Gio,Ven,Sab",saveBtn:"Salva",savedMsg:"Salvato",unsaved:"Non salvato",closeAcc:"Esci",cancelBtn:"Annulla",confirmLogoutQ:"Uscire?",confirmLogoutMsg:"Dovrai accedere di nuovo con Google.",jan:"Gennaio",feb:"Febbraio",mar:"Marzo",apr:"Aprile",may2:"Maggio",jun:"Giugno",jul:"Luglio",aug:"Agosto",sep:"Settembre",oct:"Ottobre",nov:"Novembre",dec:"Dicembre"},
  de:{tag:"Professionelle MLB-Analyse",cal:"Spielplan",opp:"Chancen",sts:"Statistiken",prf:"Profil",cfg:"Einstellungen",lv:"Live",fn:"Beendet",hm:"Heim",aw:"Gast",ml:"Moneyline",rl:"Run Line",ou:"Over/Under",cf:"Vertrauen",eg:"Vorteil",rk:"Risiko",lo:"Niedrig",md:"Mittel",hi:"Hoch",pj:"Projektion",wp:"Siegwahrsch.",an:"Analyse",bk:"← Zurück",mr:"Analyse →",lg:"Sprache",th:"Thema",dm:"Dunkel",lm:"Hell",lo2:"Abmelden",mp:"Plan",ap:"Pläne",tr:"3 Tage gratis",aq:"Frag Axe...",ao:"Axe · Online",nt:"Nachrichten",ra:"Alle lesen",fb:"Vorschläge",snd:"Senden",sg:"Senden...",tk:"Danke!",fs:"Vorschlag empfangen.",ld:"Live",dd:"Demo",ll:"Laden...",ng:"Keine Spiele",ep:"E-Mail",pp:"Passwort (min. 6)",si:"Anmelden",su:"Konto erstellen",ph:"+49 1 00 000 0000",ss:"SMS",vf:"Überprüfen",cn:"← Ändern",cs:"SMS gesendet.",gb2:"Google",eb:"E-Mail",pb:"Telefon",gb3:"Gast →",tm2:"AGB · 21+",eE:"Falsche E-Mail/Passwort.",eP:"SMS-Fehler.",eO:"Falscher Code.",eN:"Keine Verbindung.",eF:"Alle Felder ausfüllen.",ePw:"Min 6 Zeichen.",cE:"Konto erstellt!",cp:"Plan wählen",pm:"/Monat",cu:"Aktueller Plan",ac:"AKTIV",sf:"Kostenlos →",cp2:"Pro →",cp3:"Premium →",fq:"FAQ",q1:"Plan wechseln?",a1:"Ja.",q2:"Testphase?",a2:"3 Tage.",q3:"Automatisch?",a3:"Ja.",W:"S",LL:"N",PC:"PCT",sk:"Serie",l10:"Letzte 10",pt:"Pitching",of:"Offense",sd:"Tabelle",mc:"Monte Carlo",by_:"Bayes",sg2:"Vorschlag",bg:"Fehler",ft:"Funktion",cm:"Kommentar",rt:"Bewertung",ds:"Beschreibe",today:"Heute",upcoming:"Naechste",finished:"Beendet",allGames:"Alle",noGames2:"Keine Spiele",noGamesDesc:"Keine Spiele fuer diese Auswahl",months:"Jan,Feb,Mar,Apr,Mai,Jun,Jul,Aug,Sep,Okt,Nov,Dez",wdays:"So,Mo,Di,Mi,Do,Fr,Sa",saveBtn:"Speichern",savedMsg:"Gespeichert",unsaved:"Nicht gespeichert",closeAcc:"Abmelden",cancelBtn:"Abbrechen",confirmLogoutQ:"Abmelden?",confirmLogoutMsg:"Sie muessen sich erneut anmelden.",jan:"Januar",feb:"Februar",mar:"Maerz",apr:"April",may2:"Mai",jun:"Juni",jul:"Juli",aug:"August",sep:"September",oct:"Oktober",nov:"November",dec:"Dezember"},
  ja:{tag:"プロMLB野球分析",cal:"カレンダー",opp:"機会",sts:"統計",prf:"プロフィール",cfg:"設定",lv:"ライブ",fn:"終了",hm:"ホーム",aw:"アウェイ",ml:"マネーライン",rl:"ランライン",ou:"大小",cf:"信頼度",eg:"優位",rk:"リスク",lo:"低",md:"中",hi:"高",pj:"予測",wp:"勝率",an:"分析",bk:"← 戻る",mr:"分析 →",lg:"言語",th:"テーマ",dm:"ダーク",lm:"ライト",lo2:"ログアウト",mp:"プラン",ap:"プラン",tr:"3日無料",aq:"Axeに質問...",ao:"Axe · オンライン",nt:"通知",ra:"全て既読",fb:"提案",snd:"送信",sg:"送信中...",tk:"ありがとう！",fs:"提案を受け取りました。",ld:"リアルタイム",dd:"デモ",ll:"読み込み中...",ng:"試合なし",ep:"メール",pp:"パスワード（6文字以上）",si:"ログイン",su:"無料登録",ph:"+81 90 0000 0000",ss:"SMS",vf:"確認",cn:"← 変更",cs:"SMS送信済み。",gb2:"Google",eb:"メール",pb:"電話",gb3:"ゲスト →",tm2:"利用規約 · 21+",eE:"メール/パスワードエラー。",eP:"SMSエラー。",eO:"コードエラー。",eN:"接続なし。",eF:"全フィールド入力。",ePw:"6文字以上。",cE:"アカウント作成！",cp:"プラン選択",pm:"/月",cu:"現プラン",ac:"有効",sf:"無料 →",cp2:"Pro →",cp3:"Premium →",fq:"FAQ",q1:"プラン変更？",a1:"はい。",q2:"無料試用？",a2:"3日。",q3:"自動更新？",a3:"はい。",W:"勝",LL:"負",PC:"勝率",sk:"連勝",l10:"直近10",pt:"投手",of:"打撃",sd:"順位",mc:"モンテカルロ",by_:"ベイズ",sg2:"提案",bg:"バグ",ft:"機能",cm:"コメント",rt:"評価",ds:"説明",today:"今日",upcoming:"予定",finished:"終了",allGames:"全て",noGames2:"試合なし",noGamesDesc:"試合がありません",months:"1月,2月,3月,4月,5月,6月,7月,8月,9月,10月,11月,12月",wdays:"日,月,火,水,木,金,土",saveBtn:"保存",savedMsg:"保存済み",unsaved:"未保存",closeAcc:"ログアウト",cancelBtn:"キャンセル",confirmLogoutQ:"ログアウト?",confirmLogoutMsg:"Google再ログインが必要です。",jan:"1月",feb:"2月",mar:"3月",apr:"4月",may2:"5月",jun:"6月",jul:"7月",aug:"8月",sep:"9月",oct:"10月",nov:"11月",dec:"12月"},
  ko:{tag:"전문 MLB 야구 분석",cal:"일정",opp:"기회",sts:"통계",prf:"프로필",cfg:"설정",lv:"라이브",fn:"종료",hm:"홈",aw:"원정",ml:"머니라인",rl:"런라인",ou:"오버/언더",cf:"신뢰도",eg:"우위",rk:"위험",lo:"낮음",md:"중간",hi:"높음",pj:"예측",wp:"승리 확률",an:"분석",bk:"← 뒤로",mr:"분석 →",lg:"언어",th:"테마",dm:"다크",lm:"라이트",lo2:"로그아웃",mp:"플랜",ap:"플랜",tr:"3일 무료",aq:"Axe에게 질문...",ao:"Axe · 온라인",nt:"알림",ra:"모두 읽음",fb:"제안",snd:"전송",sg:"전송 중...",tk:"감사합니다！",fs:"제안이 접수되었습니다.",ld:"실시간",dd:"데모",ll:"로딩 중...",ng:"오늘 경기 없음",ep:"이메일",pp:"비밀번호 (최소 6자)",si:"로그인",su:"무료 등록",ph:"+82 10 0000 0000",ss:"SMS",vf:"확인",cn:"← 변경",cs:"SMS 전송됨.",gb2:"Google",eb:"이메일",pb:"전화",gb3:"게스트 →",tm2:"이용약관 · 21+",eE:"이메일/비밀번호 오류.",eP:"SMS 오류.",eO:"코드 오류.",eN:"연결 없음.",eF:"모든 필드 입력.",ePw:"최소 6자.",cE:"계정 생성！",cp:"플랜 선택",pm:"/월",cu:"현재 플랜",ac:"활성",sf:"무료 →",cp2:"Pro →",cp3:"Premium →",fq:"FAQ",q1:"플랜 변경?",a1:"네.",q2:"무료 체험?",a2:"3일.",q3:"자동 갱신?",a3:"네.",W:"승",LL:"패",PC:"승률",sk:"연승",l10:"최근10",pt:"투구",of:"공격",sd:"순위",mc:"몬테카를로",by_:"베이지안",sg2:"제안",bg:"버그",ft:"기능",cm:"댓글",rt:"평점",ds:"설명",today:"오늘",upcoming:"예정",finished:"종료",allGames:"전체",noGames2:"경기 없음",noGamesDesc:"경기가 없습니다",months:"1월,2월,3월,4월,5월,6월,7월,8월,9월,10월,11월,12월",wdays:"일,월,화,수,목,금,토",saveBtn:"저장",savedMsg:"저장됨",unsaved:"미저장",closeAcc:"로그아웃",cancelBtn:"취소",confirmLogoutQ:"로그아웃?",confirmLogoutMsg:"Google로 다시 로그인해야 합니다.",jan:"1월",feb:"2월",mar:"3월",apr:"4월",may2:"5월",jun:"6월",jul:"7월",aug:"8월",sep:"9월",oct:"10월",nov:"11월",dec:"12월"},
  zh:{tag:"专业MLB棒球分析",cal:"赛程",opp:"机会",sts:"统计",prf:"个人",cfg:"设置",lv:"直播",fn:"完赛",hm:"主场",aw:"客场",ml:"独赢",rl:"让分",ou:"大小",cf:"置信度",eg:"优势",rk:"风险",lo:"低",md:"中",hi:"高",pj:"预测",wp:"胜率",an:"分析",bk:"← 返回",mr:"查看分析 →",lg:"语言",th:"主题",dm:"深色",lm:"浅色",lo2:"退出",mp:"计划",ap:"计划",tr:"3天免费",aq:"向Axe提问...",ao:"Axe · 在线",nt:"通知",ra:"全部已读",fb:"建议",snd:"发送",sg:"发送中...",tk:"谢谢！",fs:"建议已收到。",ld:"实时",dd:"演示",ll:"加载中...",ng:"今天没有比赛",ep:"电子邮件",pp:"密码（至少6位）",si:"登录",su:"免费注册",ph:"+86 1 0000 0000",ss:"SMS",vf:"验证",cn:"← 更改",cs:"验证码已发送。",gb2:"Google",eb:"电子邮件",pb:"电话",gb3:"访客 →",tm2:"条款 · 21+",eE:"邮箱或密码错误。",eP:"短信错误。",eO:"验证码错误。",eN:"无连接。",eF:"填写所有字段。",ePw:"至少6个字符。",cE:"账户已创建！",cp:"选择计划",pm:"/月",cu:"当前计划",ac:"有效",sf:"免费 →",cp2:"Pro →",cp3:"Premium →",fq:"常见问题",q1:"可以更改计划吗？",a1:"是的。",q2:"免费试用？",a2:"3天。",q3:"自动续费？",a3:"是的。",W:"胜",LL:"负",PC:"胜率",sk:"连胜",l10:"近10场",pt:"投球",of:"进攻",sd:"积分榜",mc:"蒙特卡洛",by_:"贝叶斯",sg2:"建议",bg:"错误",ft:"功能",cm:"评论",rt:"评分",ds:"描述您的"},
};
const useT=lang=>TX[lang]||TX.es;

// 30 TEAMS
const TMS={NYY:{name:"New York Yankees",abbr:"NYY",clr:"#1D6FA4",div:"AL Este",era:3.71,ops:.748,wpct:.574,rpg:4.8,w:51,l:38,sk:"G3",l10:"7-3"},BOS:{name:"Boston Red Sox",abbr:"BOS",clr:"#C8102E",div:"AL Este",era:4.12,ops:.739,wpct:.512,rpg:4.6,w:45,l:43,sk:"P1",l10:"5-5"},TOR:{name:"Toronto Blue Jays",abbr:"TOR",clr:"#134A8E",div:"AL Este",era:4.08,ops:.745,wpct:.519,rpg:4.7,w:46,l:43,sk:"G1",l10:"6-4"},TB:{name:"Tampa Bay Rays",abbr:"TB",clr:"#8FBCE6",div:"AL Este",era:3.71,ops:.728,wpct:.537,rpg:4.4,w:47,l:41,sk:"G2",l10:"6-4"},BAL:{name:"Baltimore Orioles",abbr:"BAL",clr:"#DF4601",div:"AL Este",era:3.88,ops:.752,wpct:.556,rpg:4.8,w:49,l:39,sk:"G4",l10:"7-3"},CLE:{name:"Cleveland Guardians",abbr:"CLE",clr:"#E31937",div:"AL Central",era:3.77,ops:.731,wpct:.537,rpg:4.5,w:47,l:41,sk:"P2",l10:"5-5"},MIN:{name:"Minnesota Twins",abbr:"MIN",clr:"#002B5C",div:"AL Central",era:3.84,ops:.743,wpct:.537,rpg:4.7,w:47,l:41,sk:"G1",l10:"6-4"},KC:{name:"Kansas City Royals",abbr:"KC",clr:"#004687",div:"AL Central",era:3.95,ops:.722,wpct:.500,rpg:4.3,w:44,l:44,sk:"G2",l10:"5-5"},CWS:{name:"Chicago White Sox",abbr:"CWS",clr:"#27251F",div:"AL Central",era:4.45,ops:.698,wpct:.407,rpg:4.0,w:36,l:53,sk:"P4",l10:"3-7"},DET:{name:"Detroit Tigers",abbr:"DET",clr:"#0C2340",div:"AL Central",era:3.91,ops:.719,wpct:.481,rpg:4.3,w:43,l:46,sk:"G1",l10:"5-5"},HOU:{name:"Houston Astros",abbr:"HOU",clr:"#EB6E1F",div:"AL Oeste",era:3.62,ops:.758,wpct:.556,rpg:4.9,w:49,l:39,sk:"G3",l10:"7-3"},SEA:{name:"Seattle Mariners",abbr:"SEA",clr:"#005C5C",div:"AL Oeste",era:3.67,ops:.726,wpct:.537,rpg:4.4,w:47,l:41,sk:"P1",l10:"6-4"},TEX:{name:"Texas Rangers",abbr:"TEX",clr:"#003278",div:"AL Oeste",era:4.01,ops:.738,wpct:.519,rpg:4.6,w:46,l:43,sk:"G2",l10:"5-5"},LAA:{name:"Los Angeles Angels",abbr:"LAA",clr:"#BA0021",div:"AL Oeste",era:4.31,ops:.725,wpct:.463,rpg:4.4,w:41,l:48,sk:"P3",l10:"4-6"},OAK:{name:"Oakland Athletics",abbr:"OAK",clr:"#003831",div:"AL Oeste",era:4.22,ops:.712,wpct:.444,rpg:4.1,w:39,l:49,sk:"P2",l10:"4-6"},ATL:{name:"Atlanta Braves",abbr:"ATL",clr:"#CE1141",div:"NL Este",era:3.55,ops:.765,wpct:.593,rpg:5.0,w:52,l:36,sk:"G5",l10:"8-2"},PHI:{name:"Philadelphia Phillies",abbr:"PHI",clr:"#E81828",div:"NL Este",era:3.79,ops:.751,wpct:.556,rpg:4.8,w:49,l:39,sk:"G2",l10:"7-3"},NYM:{name:"New York Mets",abbr:"NYM",clr:"#002D72",div:"NL Este",era:3.88,ops:.741,wpct:.537,rpg:4.7,w:47,l:41,sk:"P1",l10:"6-4"},WSH:{name:"Washington Nationals",abbr:"WSH",clr:"#AB0003",div:"NL Este",era:4.28,ops:.719,wpct:.444,rpg:4.3,w:39,l:49,sk:"G1",l10:"4-6"},MIA:{name:"Miami Marlins",abbr:"MIA",clr:"#00A3E0",div:"NL Este",era:4.15,ops:.708,wpct:.444,rpg:4.1,w:39,l:49,sk:"P2",l10:"4-6"},MIL:{name:"Milwaukee Brewers",abbr:"MIL",clr:"#12284B",div:"NL Central",era:3.91,ops:.718,wpct:.519,rpg:4.4,w:46,l:43,sk:"G1",l10:"5-5"},CHC:{name:"Chicago Cubs",abbr:"CHC",clr:"#0E3386",div:"NL Central",era:4.05,ops:.729,wpct:.500,rpg:4.5,w:44,l:44,sk:"P1",l10:"5-5"},STL:{name:"St. Louis Cardinals",abbr:"STL",clr:"#C41E3A",div:"NL Central",era:3.95,ops:.733,wpct:.519,rpg:4.5,w:46,l:43,sk:"G2",l10:"6-4"},PIT:{name:"Pittsburgh Pirates",abbr:"PIT",clr:"#FDB827",div:"NL Central",era:4.11,ops:.714,wpct:.463,rpg:4.2,w:41,l:48,sk:"P1",l10:"4-6"},CIN:{name:"Cincinnati Reds",abbr:"CIN",clr:"#C6011F",div:"NL Central",era:4.19,ops:.733,wpct:.481,rpg:4.5,w:43,l:46,sk:"G1",l10:"5-5"},LAD:{name:"Los Angeles Dodgers",abbr:"LAD",clr:"#005A9C",div:"NL Oeste",era:3.45,ops:.772,wpct:.621,rpg:5.1,w:55,l:34,sk:"G6",l10:"8-2"},SF:{name:"San Francisco Giants",abbr:"SF",clr:"#FD5A1E",div:"NL Oeste",era:3.98,ops:.722,wpct:.481,rpg:4.3,w:43,l:46,sk:"P1",l10:"5-5"},SD:{name:"San Diego Padres",abbr:"SD",clr:"#2F241D",div:"NL Oeste",era:3.74,ops:.744,wpct:.556,rpg:4.7,w:49,l:39,sk:"G3",l10:"7-3"},ARI:{name:"Arizona Diamondbacks",abbr:"ARI",clr:"#A71930",div:"NL Oeste",era:4.18,ops:.736,wpct:.500,rpg:4.5,w:44,l:44,sk:"P2",l10:"5-5"},COL:{name:"Colorado Rockies",abbr:"COL",clr:"#33006F",div:"NL Oeste",era:4.89,ops:.748,wpct:.426,rpg:4.8,w:38,l:51,sk:"P3",l10:"3-7"}};
const DIVS=["AL Este","AL Central","AL Oeste","NL Este","NL Central","NL Oeste"];
const MID={147:"NYY",111:"BOS",141:"TOR",139:"TB",110:"BAL",114:"CLE",142:"MIN",118:"KC",145:"CWS",116:"DET",117:"HOU",136:"SEA",140:"TEX",108:"LAA",133:"OAK",144:"ATL",143:"PHI",121:"NYM",120:"WSH",146:"MIA",158:"MIL",112:"CHC",138:"STL",134:"PIT",113:"CIN",119:"LAD",137:"SF",135:"SD",109:"ARI",115:"COL"};

// PLANS  Starter $1.99 · Pro $4.99 · Premium $9.99
const PLANS={
  starter:{n:"Starter",p:"$1.99",clr:"#6366f1",axe:10,features:["Todos los partidos del día","En vivo · marcador · diamante","Predicciones básicas ML/RL/O-U","30 equipos MLB","Estadísticas generales","Asistente Axe (10/día)","Notificaciones · Calendario","9 idiomas · Modo claro/oscuro"],today:"今天",upcoming:"即将",finished:"已结束",allGames:"全部",noGames2:"没有比赛",noGamesDesc:"没有比赛",months:"1月,2月,3月,4月,5月,6月,7月,8月,9月,10月,11月,12月",wdays:"日,一,二,三,四,五,六",saveBtn:"保存",savedMsg:"已保存",unsaved:"未保存",closeAcc:"退出",cancelBtn:"取消",confirmLogoutQ:"退出?",confirmLogoutMsg:"需要重新登录Google。",jan:"1月",feb:"2月",mar:"3月",apr:"4月",may2:"5月",jun:"6月",jul:"7月",aug:"8月",sep:"9月",oct:"10月",nov:"11月",dec:"12月"},
  pro:{n:"Pro",p:"$4.99",clr:"#8b5cf6",axe:100,popular:true,features:["Todo del Starter","Monte Carlo + Bayesiano","Moneyline avanzado","Run Line con sabermetría","Over/Under con modelos climáticos","xERA · FIP · wRC+ · wOBA","Axe IA (100/día)","Alertas inteligentes","Tendencias · Comparaciones","Reportes descargables","Filtros avanzados"]},
  premium:{n:"Premium",p:"$9.99",clr:"#10b981",axe:Infinity,features:["Todo del Pro","Simulaciones ilimitadas","Axe IA ilimitado + memoria completa","Modelos predictivos de élite","Estadísticas históricas completas","Dashboard personalizable","Reportes Premium PDF","Herramientas exclusivas","Acceso anticipado a funciones","Soporte prioritario 24/7"]},
};

// MONTE CARLO + BAYESIAN ENGINE
function predict(away,home,pf=1,wind="",hE=null,aE=null){
  const H=TMS[home],A=TMS[away];
  if(!H||!A) return null;
  let mc=0;
  for(let i=0;i<10000;i++) if(H.wpct*(0.85+Math.random()*.3)*pf>A.wpct*(0.85+Math.random()*.3)) mc++;
  const mcp=mc/10000*100;
  const eH=hE||H.era,eA=aE||A.era,eAdj=(eA-eH)*3.5;
  let hW=Math.round(Math.min(76,Math.max(28,mcp*.65+(mcp+eAdj)*.35)));
  const aW=100-hW;
  const wB=wind.includes("OUT")?1.09:wind.includes("IN")?0.92:1;
  const proj=+((H.rpg+A.rpg)/2*pf*wB*(1+((4.5-eH)/4.5+(4.5-eA)/4.5)/2*.12)).toFixed(1);
  const line=Math.round(proj*2)/2;
  const hO=hW>50?-Math.round((hW/(100-hW))*100):Math.round(((100-hW)/hW)*100);
  const aO=aW>50?-Math.round((aW/(100-aW))*100):Math.round(((100-aW)/aW)*100);
  const impl=110/(hO<0?Math.abs(hO)+100:100+hO)*100;
  const edge=+(hW-impl).toFixed(1);
  const conf=Math.round(Math.min(91,54+Math.abs(hW-50)*.6+Math.abs(eH-eA)*4));
  const risk=conf>=75?"Bajo":conf>=62?"Medio":"Alto";
  const grade=conf>=80&&edge>4?"A":conf>=68&&edge>1.5?"B":conf>=56?"C":"D";
  return{hW,aW,hO,aO,edge,conf,proj,line,overP:proj>line?58:42,underP:proj>line?42:58,rl:Math.round(hW*.72),grade,rec:proj>line?"OVER":"UNDER",risk,mc:Math.round(mcp),eAdj:+eAdj.toFixed(1)};
}
const fO=n=>n>=0?`+${n}`:`${n}`;

// MLB API (2 CORS proxies + demo fallback)
async function fetchLive(){
  const today=new Date().toISOString().split("T")[0];
  const px=[u=>`https://corsproxy.io/?${encodeURIComponent(u)}`,u=>`https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`];
  for(const p of px){
    try{
      const r=await fetch(p(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${today}&hydrate=team,linescore,probablePitcher,venue,weather`),{signal:AbortSignal.timeout(7000)});
      if(!r.ok) continue;
      const d=await r.json();
      if(!d?.dates?.[0]?.games?.length) return null;
      const gs=d.dates[0].games.map(g=>{
        const hm=g.teams?.home,aw=g.teams?.away,ls=g.linescore,abs=g.status?.abstractGameState;
        const gd=new Date(g.gameDate);
        const hA=MID[hm?.team?.id]||Object.values(TMS).find(x=>x.name===hm?.team?.name)?.abbr;
        const aA=MID[aw?.team?.id]||Object.values(TMS).find(x=>x.name===aw?.team?.name)?.abbr;
        if(!hA||!aA||!TMS[hA]||!TMS[aA]) return null;
        const iL=abs==="Live",iF=abs==="Final";
        return{id:g.gamePk,home:hA,away:aA,venue:g.venue?.name||"TBD",
          time:gd.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",timeZone:"America/New_York"})+" ET",
          gameHour:gd.getHours(),homeP:hm?.probablePitcher?.fullName||"TBD",awayP:aw?.probablePitcher?.fullName||"TBD",
          homePERA:null,awayPERA:null,
          wx:g.weather?{temp:g.weather.temp||"—",wind:g.weather.wind||"—",sky:"🌤️",desc:g.weather.condition||"—"}:{temp:"—",wind:"—",sky:"🌤️",desc:"—"},
          pf:1.0,isLive:iL,isFinal:iF,
          sim:(iL||iF)?{away:aw?.score??ls?.teams?.away?.runs??0,home:hm?.score??ls?.teams?.home?.runs??0,
            inn:ls?.currentInning??1,half:ls?.isTopInning?"T":"B",outs:ls?.outs??0,
            awayH:ls?.teams?.away?.hits??0,homeH:ls?.teams?.home?.hits??0,
            bases:[!!ls?.offense?.first,!!ls?.offense?.second,!!ls?.offense?.third]}:null,source:"live"};
      }).filter(Boolean);
      return gs.length>0?gs:null;
    }catch(e){continue;}
  }
  return null;
}

function buildDemo(){
  const h=new Date().getHours();
  const S=[
    {id:1001,away:"NYY",home:"BOS",venue:"Fenway Park",time:"1:10 PM ET",gameHour:13,awayP:"Gerrit Cole",awayPERA:2.89,homeP:"Brayan Bello",homePERA:3.54,wx:{temp:71,wind:"8 mph E",sky:"⛅",desc:"Partly Cloudy"},pf:1.08,sim:{away:3,home:2,inn:7,half:"T",outs:1,awayH:7,homeH:5,bases:[true,false,false]}},
    {id:1002,away:"SF",home:"LAD",venue:"Dodger Stadium",time:"2:10 PM ET",gameHour:14,awayP:"Logan Webb",awayPERA:3.21,homeP:"Y. Yamamoto",homePERA:2.71,wx:{temp:78,wind:"5 mph W",sky:"☀️",desc:"Sunny"},pf:0.99,sim:{away:1,home:4,inn:4,half:"B",outs:2,awayH:4,homeH:8,bases:[false,true,false]}},
    {id:1003,away:"ATL",home:"PHI",venue:"Citizens Bank Park",time:"4:05 PM ET",gameHour:16,awayP:"Spencer Strider",awayPERA:2.44,homeP:"Zack Wheeler",homePERA:2.91,wx:{temp:82,wind:"12 mph SW",sky:"☀️",desc:"Clear"},pf:1.06},
    {id:1004,away:"HOU",home:"TEX",venue:"Globe Life Field",time:"4:10 PM ET",gameHour:16,awayP:"Framber Valdez",awayPERA:2.97,homeP:"Nathan Eovaldi",homePERA:3.42,wx:{temp:91,wind:"7 mph S",sky:"🌡️",desc:"Hot"},pf:1.01},
    {id:1005,away:"MIL",home:"CHC",venue:"Wrigley Field",time:"7:08 PM ET",gameHour:19,awayP:"Freddy Peralta",awayPERA:3.18,homeP:"Justin Steele",homePERA:3.05,wx:{temp:74,wind:"15 mph OUT",sky:"💨",desc:"Windy"},pf:1.03},
    {id:1006,away:"SD",home:"NYM",venue:"Citi Field",time:"7:10 PM ET",gameHour:19,awayP:"Dylan Cease",awayPERA:3.37,homeP:"Kodai Senga",homePERA:2.88,wx:{temp:76,wind:"9 mph NE",sky:"🌤️",desc:"Clear"},pf:1.00},
    {id:1007,away:"CLE",home:"BAL",venue:"Oriole Park",time:"7:40 PM ET",gameHour:19,awayP:"Shane Bieber",awayPERA:3.47,homeP:"Corbin Burnes",homePERA:2.78,wx:{temp:79,wind:"6 mph E",sky:"☀️",desc:"Clear"},pf:1.01},
    {id:1008,away:"MIN",home:"SEA",venue:"T-Mobile Park",time:"10:10 PM ET",gameHour:22,awayP:"Pablo Lopez",awayPERA:3.14,homeP:"Luis Castillo",homePERA:3.08,wx:{temp:65,wind:"4 mph W",sky:"🌥️",desc:"Overcast"},pf:0.95},
  ];
  return S.map(g=>({...g,isLive:h>=g.gameHour&&h<g.gameHour+3&&!!g.sim,isFinal:h>=g.gameHour+3&&!!g.sim,source:"demo"}));
}

// SUPABASE AUTH
const SB="https://mojcqdvsahciksczoqhb.supabase.co";
const AUTH={
  user:null,token:null,
  k(){try{return localStorage.getItem("mlb_sbk")||"";}catch(e){return "";}},
  async up(e,p){try{const r=await fetch(`${SB}/auth/v1/signup`,{method:"POST",headers:{"apikey":this.k(),"Content-Type":"application/json"},body:JSON.stringify({email:e,password:p})});const d=await r.json();if(d.access_token){this.sv(d);return{ok:true,user:d.user};}return{ok:false,e:"signup"};}catch(e){return{ok:false,e:"net"};}},
  async si(e,p){try{const r=await fetch(`${SB}/auth/v1/token?grant_type=password`,{method:"POST",headers:{"apikey":this.k(),"Content-Type":"application/json"},body:JSON.stringify({email:e,password:p})});const d=await r.json();if(d.access_token){this.sv(d);return{ok:true,user:d.user};}return{ok:false,e:"creds"};}catch(e){return{ok:false,e:"net"};}},
  async otp(ph){try{const r=await fetch(`${SB}/auth/v1/otp`,{method:"POST",headers:{"apikey":this.k(),"Content-Type":"application/json"},body:JSON.stringify({phone:ph})});const d=await r.json();return d.error?{ok:false,e:"phone"}:{ok:true};}catch(e){return{ok:false,e:"net"};}},
  async votp(ph,tok){try{const r=await fetch(`${SB}/auth/v1/verify`,{method:"POST",headers:{"apikey":this.k(),"Content-Type":"application/json"},body:JSON.stringify({phone:ph,token:tok,type:"sms"})});const d=await r.json();if(d.access_token){this.sv(d);return{ok:true,user:d.user};}return{ok:false,e:"otp"};}catch(e){return{ok:false,e:"net"};}},
  sv(d){this.token=d.access_token;this.user=d.user;try{localStorage.setItem("mlb_tok",d.access_token);localStorage.setItem("mlb_usr",JSON.stringify(d.user));}catch(e){}},
  out(){this.token=null;this.user=null;try{localStorage.removeItem("mlb_tok");localStorage.removeItem("mlb_usr");}catch(e){}},
  restore(){try{const t=localStorage.getItem("mlb_tok"),u=localStorage.getItem("mlb_usr");if(t&&u){this.token=t;this.user=JSON.parse(u);return true;}}catch(e){}return false;},
  gUrl(){try{return`${SB}/auth/v1/authorize?provider=google&redirect_to=${window.location.origin}`;}catch(e){return"#";}},
};

// AXE AI (multilingual, identity hidden, conversation memory)
async function askAxe(q,history,lang){
  try{
    const ln=LANGS[lang]?.n||"Español";
    const msgs=history.slice(-8).map(m=>({role:m.u?"user":"assistant",content:m.text}));
    msgs.push({role:"user",content:q});
    const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      model:"claude-sonnet-4-6",max_tokens:320,
      system:`You are Axe, the official MLBEdge assistant. Expert in MLB baseball and sports analytics. NEVER mention Claude, Anthropic, OpenAI or any AI provider. If asked who built you: "I was built by the MLBEdge team." Always respond in ${ln}. Max 3 sentences. Natural and expert tone. Help with: MLB rules/stats/teams/players, ERA/xERA/FIP/wRC+/wOBA/OPS/BABIP sabermetrics, Moneyline/RunLine/Over-Under betting analysis, MLBEdge subscription plans (Starter $1.99, Pro $4.99, Premium $9.99 - all with 3 free days), app navigation and features.`,
      messages:msgs})});
    const d=await r.json();
    return d.content?.map(b=>b.text||"").join("")||"Intenta de nuevo.";
  }catch(e){return "No pude procesar tu consulta en este momento.";}
}

// ATOMS
function Ring({grade,conf,sz=40,D}){
  const c=GC[grade]||D.il,r=sz/2-3,ci=2*Math.PI*r,da=(conf/100)*ci;
  return<div style={{position:"relative",width:sz,height:sz,flexShrink:0}}>
    <svg viewBox={`0 0 ${sz} ${sz}`} style={{position:"absolute",inset:0,width:"100%",height:"100%"}}>
      <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={D.gb} strokeWidth="2.5"/>
      <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={c} strokeWidth="2.5" strokeDasharray={`${da} ${ci}`} strokeLinecap="round" transform={`rotate(-90 ${sz/2} ${sz/2})`} style={{filter:`drop-shadow(0 0 4px ${c}66)`}}/>
    </svg>
    <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:sz*.32,fontWeight:900,color:c}}>{grade}</div>
  </div>;
}
function Chip({label,value,color,D}){
  return<div style={{flex:1,background:D.gl,border:`1px solid ${D.gb}`,borderRadius:9,padding:"7px 4px",textAlign:"center",minWidth:0}}>
    <div style={{fontSize:12,fontWeight:800,color:color||D.tx,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{value}</div>
    <div style={{fontSize:7,color:D.mt,textTransform:"uppercase",letterSpacing:"0.07em",marginTop:2}}>{label}</div>
  </div>;
}
function SL({icon,ch,D}){
  return<div style={{fontSize:9,fontWeight:700,color:D.il,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:9,display:"flex",alignItems:"center",gap:7}}>
    <div style={{height:1,width:12,background:`linear-gradient(90deg,${D.ind},transparent)`}}/>
    {icon&&<span style={{fontSize:11}}>{icon}</span>}{ch}
    <div style={{height:1,flex:1,background:`linear-gradient(90deg,${D.il}33,transparent)`}}/>
  </div>;
}
function Dot({c="#10b981"}){return<div style={{width:7,height:7,borderRadius:"50%",background:c,boxShadow:`0 0 7px ${c}`,animation:"vP 1.5s ease infinite",flexShrink:0}}/>;}
function Sp(){return<span style={{animation:"vS .7s linear infinite",display:"inline-block",marginRight:6}}>◌</span>;}

// AUTH SCREEN
function AuthScreen({dark,onAuth,lang}){
  const D=dark?DK:LT;
  const t=useT(lang);
  const bg={minHeight:"100vh",background:D.bg0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px",fontFamily:"'Inter',system-ui,sans-serif"};
  return(
    <div style={bg}>
      <div style={{position:"relative",zIndex:1,width:"100%",maxWidth:380,textAlign:"center"}}>
        <div style={{fontSize:52,marginBottom:12}}>⚾</div>
        <div style={{fontSize:28,fontWeight:900,color:D.tx,marginBottom:6,letterSpacing:"-0.04em"}}>MLB<span style={{color:D.ind}}>Edge</span></div>
        <div style={{fontSize:12,color:D.mt,marginBottom:36}}>{t.tag}</div>
        <div style={{background:D.bg1,border:`1px solid ${D.gb}`,borderRadius:18,padding:"28px 24px",marginBottom:16,boxShadow:dark?"0 20px 60px rgba(0,0,0,0.4)":"0 4px 20px rgba(0,0,0,0.08)"}}>
          <div style={{fontSize:13,color:D.mt,marginBottom:20,lineHeight:1.6}}>{t.gb2||"Inicia sesion con Google"}</div>
          <a href={AUTH.gUrl()} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,padding:"15px",borderRadius:13,border:`1px solid ${D.gb}`,background:dark?"rgba(255,255,255,0.06)":"#fff",textDecoration:"none",boxShadow:dark?"0 4px 20px rgba(0,0,0,0.3)":"0 2px 12px rgba(0,0,0,0.1)"}}>
            <svg width="22" height="22" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            <span style={{fontSize:15,fontWeight:700,color:D.tx}}>{t.gb2||"Continuar con Google"}</span>
          </a>
        </div>
        <div style={{fontSize:10,color:D.mt,lineHeight:1.7}}>{t.tm2||"Solo para analisis informativo · +21"}</div>
      </div>
    </div>
  );
}


// GAME CARD
// LOGOS MLB - ESPN CDN + fallback color
const LOGO_BASE="https://a.espncdn.com/i/teamlogos/mlb/500/";
const LOGO_IDS={NYY:"nyy",BOS:"bos",TOR:"tor",TB:"tb",BAL:"bal",CLE:"cle",MIN:"min",KC:"kc",CWS:"cws",DET:"det",HOU:"hou",SEA:"sea",TEX:"tex",LAA:"laa",OAK:"oak",ATL:"atl",PHI:"phi",NYM:"nym",WSH:"wsh",MIA:"mia",MIL:"mil",CHC:"chc",STL:"stl",PIT:"pit",CIN:"cin",LAD:"lad",SF:"sf",SD:"sd",ARI:"ari",COL:"col"};
function TeamLogo({abbr,size=40}){
  const tm=TMS[abbr];
  const clr=tm?tm.clr:"#6366f1";
  const id=LOGO_IDS[abbr];
  const [err,setErr]=useState(false);
  if(!id||err) return <div style={{width:size,height:size,borderRadius:Math.round(size*.22),background:clr+"22",border:"1.5px solid "+clr+"44",display:"flex",alignItems:"center",justifyContent:"center",fontSize:Math.round(size*.28),fontWeight:900,color:clr,flexShrink:0}}>{abbr}</div>;
  return <img src={LOGO_BASE+id+".png"} alt={abbr} width={size} height={size} onError={()=>setErr(true)} style={{width:size,height:size,objectFit:"contain",flexShrink:0,borderRadius:Math.round(size*.15)}}/>;
}

const GameCard=memo(function({game,idx,onSelect,D,t}){
  const H=TMS[game.home],A=TMS[game.away];
  if(!H||!A) return null;
  const p=useRef(predict(game.away,game.home,game.pf||1,game.wx?.wind||"",game.homePERA,game.awayPERA)).current;
  if(!p) return null;
  const ec=p.edge>5?D.gr:p.edge>2?D.ind:p.edge>0?D.am:D.mt;
  return(
    <div onClick={()=>onSelect(game)} style={{borderRadius:18,overflow:"hidden",animation:`vU 0.3s ${idx*.04}s both ease`,border:`1px solid ${game.isLive?"rgba(16,185,129,0.3)":D.gb}`,background:D.bg1,boxShadow:D===DK?(game.isLive?"0 0 0 1px rgba(16,185,129,0.1),0 8px 28px rgba(0,0,0,0.5)":"0 4px 16px rgba(0,0,0,0.3)"):"0 2px 10px rgba(0,0,0,0.07)",cursor:"pointer"}}>
      <div style={{height:3,background:`linear-gradient(90deg,${A.clr},${H.clr})`}}/>
      <div style={{padding:"12px 13px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {game.isLive
              ?<span style={{display:"inline-flex",alignItems:"center",gap:5,background:"rgba(16,185,129,0.12)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:99,padding:"3px 9px",fontSize:9,fontWeight:700,color:D.gr}}><Dot/> {t.lv} {game.sim?.half==="T"?"▲":"▼"}{game.sim?.inn}</span>
              :game.isFinal
                ?<span style={{background:D.gl,border:`1px solid ${D.gb}`,borderRadius:99,padding:"3px 9px",fontSize:9,fontWeight:600,color:D.mt}}>{t.fn}</span>
                :<span style={{background:`${D.ind}14`,border:`1px solid ${D.il}33`,borderRadius:99,padding:"3px 9px",fontSize:9,fontWeight:600,color:D.il}}>{game.time}</span>}
            <span style={{fontSize:9,color:D.mt}}>{game.venue?.split(" ").slice(0,2).join(" ")}</span>
            {game.source==="live"&&<span style={{fontSize:7,color:D.gr,background:`${D.gr}14`,border:`1px solid ${D.gr}28`,borderRadius:4,padding:"1px 5px",fontWeight:700}}>⚡ LIVE</span>}
          </div>
          <Ring grade={p.grade} conf={p.conf} sz={36} D={D}/>
        </div>
        {(game.isLive||game.isFinal)&&game.sim?(
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:9,padding:"9px 14px",background:D.gl,borderRadius:12,border:`1px solid ${D.gb}`}}>
            {[{tm:A,sc:game.sim.away,h:game.sim.awayH},{tm:H,sc:game.sim.home,h:game.sim.homeH}].map((x,i)=>(
              <div key={i} style={{textAlign:"center"}}>
                <div style={{display:"flex",justifyContent:"center",marginBottom:3}}><TeamLogo abbr={x.tm.abbr} size={32}/></div>
                <div style={{fontSize:9,fontWeight:700,color:x.tm.clr,marginBottom:1}}>{x.tm.abbr}</div>
                <div style={{fontSize:28,fontWeight:900,color:D.tx,lineHeight:1}}>{x.sc}</div>
                <div style={{fontSize:7,color:D.mt,marginTop:1}}>{x.h}H</div>
              </div>
            ))}
            {game.isLive&&game.sim.bases&&(
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                <div style={{position:"relative",width:26,height:26}}>
                  {[[13,0,1],[26,13,0],[0,13,2]].map(([x,y,i])=>(
                    <div key={i} style={{position:"absolute",left:x-5,top:y-5,width:10,height:10,background:game.sim.bases[i]?"#f59e0b":"rgba(255,255,255,0.12)",border:`1px solid ${game.sim.bases[i]?"#f59e0b":"rgba(255,255,255,0.2)"}`,transform:"rotate(45deg)"}}/>
                  ))}
                </div>
                <div style={{fontSize:8,color:D.mt}}>{game.sim.outs}out</div>
              </div>
            )}
          </div>
        ):(
          <div style={{display:"flex",alignItems:"center",marginBottom:9}}>
            {[{tm:A,label:t.aw},null,{tm:H,label:t.hm}].map((x,i)=>{
              if(!x) return<div key="at" style={{padding:"0 8px",color:D.mt,fontWeight:700}}>@</div>;
              return<div key={i} style={{flex:1,textAlign:"center"}}>
                <div style={{display:"flex",justifyContent:"center",marginBottom:6}}><TeamLogo abbr={x.tm.abbr} size={42}/></div>
                <div style={{fontSize:11,fontWeight:700,color:D.tx}}>{x.tm.name.split(" ").pop()}</div>
                <div style={{fontSize:9,color:D.mt,marginTop:1}}>{x.label}</div>
              </div>;
            })}
          </div>
        )}
        {!game.isFinal&&<div style={{display:"flex",gap:4,marginBottom:8}}>
          <Chip label={t.ml} value={fO(p.hO)} color={H.clr} D={D}/>
          <Chip label={t.rl} value={`${p.rl}%`} color={D.vi} D={D}/>
          <Chip label={p.rec==="OVER"?`${t.ou}▲`:`${t.ou}▼`} value={`${p.rec==="OVER"?p.overP:p.underP}%`} color={p.rec==="OVER"?D.gr:D.ind} D={D}/>
          <Chip label={t.cf} value={`${p.conf}%`} color={D.il} D={D}/>
        </div>}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:9,color:D.mt}}>⚾ {game.awayP?.split(" ").pop()||"TBD"} vs {game.homeP?.split(" ").pop()||"TBD"} · {game.wx?.sky} {game.wx?.temp}°</div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:9,fontWeight:700,color:ec,background:`${ec}14`,border:`1px solid ${ec}28`,borderRadius:6,padding:"2px 7px"}}>{p.edge>0?"+":""}{p.edge}%</span>
            <span style={{fontSize:9,color:D.il,fontWeight:600}}>{t.mr}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

// GAME DETAIL
function GameDetail({game,onBack,D,t}){
  const H=TMS[game.home],A=TMS[game.away];
  const p=predict(game.away,game.home,game.pf||1,game.wx?.wind||"",game.homePERA,game.awayPERA);
  return(
    <div style={{minHeight:"100vh",background:D.bg0}}>
      <div style={{position:"sticky",top:0,zIndex:30,background:D===DK?"rgba(10,14,26,0.97)":"rgba(240,244,248,0.97)",backdropFilter:"blur(24px)",borderBottom:`1px solid ${D.gb}`,padding:"12px 14px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={onBack} style={{background:D.gl,border:`1px solid ${D.gb}`,borderRadius:10,padding:"7px 12px",color:D.sb,fontSize:12,fontWeight:600,cursor:"pointer"}}>{t.bk}</button>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:900,color:D.tx}}><span style={{color:A?.clr}}>{A?.abbr}</span><span style={{color:D.mt,margin:"0 5px",fontWeight:400}}>@</span><span style={{color:H?.clr}}>{H?.abbr}</span></div>
            <div style={{fontSize:9,color:D.mt}}>{game.venue} · {game.isLive?`🔴 ${t.lv}`:game.isFinal?t.fn:game.time}</div>
          </div>
          {p&&<Ring grade={p.grade} conf={p.conf} sz={38} D={D}/>}
        </div>
      </div>
      <div style={{padding:"14px 13px 90px"}}>
        {(game.isLive||game.isFinal)&&game.sim&&(
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,padding:"14px 18px",background:`linear-gradient(135deg,${A?.clr||D.mt}14,${H?.clr||D.ind}14)`,border:`1px solid ${D.gb}`,borderRadius:16}}>
            {[{tm:A,sc:game.sim.away,h:game.sim.awayH},{tm:H,sc:game.sim.home,h:game.sim.homeH}].map((x,i)=>(
              <div key={i} style={{textAlign:"center"}}>
                <div style={{fontSize:10,fontWeight:700,color:x.tm?.clr,marginBottom:3}}>{x.tm?.abbr}</div>
                <div style={{fontSize:44,fontWeight:900,color:D.tx,lineHeight:1}}>{x.sc}</div>
                <div style={{fontSize:8,color:D.mt,marginTop:2}}>{x.h}H</div>
              </div>
            ))}
            {game.isLive&&<div style={{textAlign:"center"}}><Dot/><div style={{fontSize:10,color:D.gr,fontWeight:700,marginTop:3}}>{game.sim.half==="T"?"▲":"▼"}{game.sim.inn}</div></div>}
          </div>
        )}
        {p&&<>
          <div style={{marginBottom:12,padding:"8px 12px",background:`${D.ind}0a`,border:`1px solid ${D.il}22`,borderRadius:10,display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:16}}>🧠</span>
            <div>
              <div style={{fontSize:10,fontWeight:700,color:D.il}}>{t.mc} + {t.by_} · Grade {p.grade}</div>
              <div style={{fontSize:9,color:D.mt}}>MC: {p.mc}% local · ERA adj: {p.eAdj>0?"+":""}{p.eAdj}%</div>
            </div>
          </div>
          <div style={{display:"flex",gap:4,marginBottom:12}}>
            <Chip label={`${t.ml} L`} value={fO(p.hO)} color={H?.clr||D.ind} D={D}/>
            <Chip label={`${t.ml} V`} value={fO(p.aO)} color={A?.clr||D.mt} D={D}/>
            <Chip label={`O/U ${p.line}`} value={p.rec} color={p.rec==="OVER"?D.gr:D.ind} D={D}/>
            <Chip label={t.cf} value={`${p.conf}%`} color={D.il} D={D}/>
          </div>
          <div style={{background:D.gl,border:`1px solid ${D.gb}`,borderRadius:13,padding:"13px",marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:7,fontSize:11}}>
              <span style={{color:A?.clr,fontWeight:700}}>{A?.abbr} {p.aW}%</span>
              <span style={{fontSize:9,color:D.mt,textTransform:"uppercase",letterSpacing:"0.08em"}}>{t.wp}</span>
              <span style={{color:H?.clr,fontWeight:700}}>{p.hW}% {H?.abbr}</span>
            </div>
            <div style={{display:"flex",borderRadius:99,overflow:"hidden",height:10,gap:1}}>
              <div style={{width:`${p.aW}%`,background:A?.clr||D.mt,transition:"width 1s ease"}}/>
              <div style={{width:`${p.hW}%`,background:H?.clr||D.ind,transition:"width 1s ease"}}/>
            </div>
          </div>
          <SL icon="📊" ch={t.an} D={D}/>
          {[
            {title:`💵 ${t.ml}`,color:D.ind,txt:`${p.hW>p.aW?H?.name:A?.name} favorito con ${Math.max(p.hW,p.aW)}% (MC ${p.mc}%). Confianza: ${p.conf}%.`,rec:`${p.hW>p.aW?H?.abbr:A?.abbr} ML ${fO(p.hW>p.aW?p.hO:p.aO)}`},
            {title:`📏 ${t.rl}`,color:D.vi,txt:`${p.rl}% probabilidad de cubrir −1.5. Riesgo: ${p.risk}. Ajuste ERA bayesiano: ${p.eAdj>0?"+":""}${p.eAdj}%.`,rec:`${p.hW>p.aW?H?.abbr:A?.abbr} −1.5`},
            {title:`⚡ ${t.ou}`,color:p.rec==="OVER"?D.gr:D.il,txt:`Proyección ${p.proj}R vs línea ${p.line}. ${game.wx?.wind?.includes("OUT")?"Viento OUT → Over favorecido.":"Modelos de pitcheo + ofensiva."}`,rec:`${p.rec} ${p.line} (${p.rec==="OVER"?p.overP:p.underP}%)`},
          ].map(({title,color,txt,rec})=>(
            <div key={title} style={{background:`${color}0a`,border:`1px solid ${color}22`,borderRadius:13,padding:"12px",marginBottom:9}}>
              <div style={{fontSize:11,fontWeight:800,color,marginBottom:6}}>{title}</div>
              <p style={{fontSize:11,color:D.sb,lineHeight:1.65,margin:"0 0 7px"}}>{txt}</p>
              <div style={{fontSize:11,fontWeight:700,color,background:`${color}14`,borderRadius:8,padding:"6px 10px"}}>{rec}</div>
            </div>
          ))}
          {game.wx&&<div style={{background:D.gl,border:`1px solid ${D.gb}`,borderRadius:12,padding:"12px",display:"flex",alignItems:"center",gap:9}}>
            <span style={{fontSize:18}}>{game.wx.sky}</span>
            <div style={{flex:1}}><div style={{fontSize:11,fontWeight:600,color:D.tx}}>{game.wx.desc}</div><div style={{fontSize:9,color:D.mt,marginTop:1}}>{game.wx.temp}°F · {game.wx.wind}</div></div>
            {game.wx.wind?.includes("OUT")&&<span style={{fontSize:9,color:D.gr,fontWeight:700,background:`${D.gr}14`,border:`1px solid ${D.gr}28`,borderRadius:6,padding:"2px 7px"}}>↑ OVER</span>}
            {game.wx.wind?.includes("IN")&&<span style={{fontSize:9,color:D.il,fontWeight:700,background:`${D.ind}14`,border:`1px solid ${D.il}28`,borderRadius:6,padding:"2px 7px"}}>↓ UNDER</span>}
          </div>}
        </>}
      </div>
    </div>
  );
}

// OPPORTUNITIES
function OppsScreen({games,onSelect,D,t,userPlan}){
  const [filter,setFilter]=useState("all");
  const [sort,setSort]=useState("conf");
  const isPro=userPlan==="pro"||userPlan==="premium";
  const opps=games.filter(g=>!g.isFinal).map(g=>{
    const p=predict(g.away,g.home,g.pf||1,g.wx?.wind||"",g.homePERA,g.awayPERA);
    if(!p) return null;
    return{...g,p,mlR:{abbr:p.hW>p.aW?g.home:g.away,prob:Math.max(p.hW,p.aW),line:fO(p.hW>p.aW?p.hO:p.aO)},
      rlR:{abbr:p.hW>p.aW?g.home:g.away,cov:p.rl},
      ouR:{rec:p.rec,line:p.line,proj:p.proj,prob:p.rec==="OVER"?p.overP:p.underP},
      reason:`${t.mc}: ${p.mc}% local · ERA adj: ${p.eAdj>0?"+":""}${p.eAdj}% · Proy ${p.proj}R vs L${p.line}`};
  }).filter(Boolean)
    .filter(g=>filter==="all"?true:filter==="over"?g.p.rec==="OVER":filter==="under"?g.p.rec==="UNDER":filter==="live"?g.isLive:true)
    .sort((a,b)=>sort==="conf"?b.p.conf-a.p.conf:sort==="edge"?b.p.edge-a.p.edge:a.gameHour-b.gameHour);
  const RC={Bajo:D.gr,Medio:D.am,Alto:D.rd};
  return(
    <div>
      <div style={{padding:"12px 13px 0"}}>
        <div style={{fontSize:20,fontWeight:900,color:D.tx,marginBottom:2,letterSpacing:"-0.03em"}}>{t.opp}</div>
        <div style={{fontSize:10,color:D.mt,marginBottom:10}}>{opps.length} partidos · {new Date().toLocaleDateString()}</div>
        <div style={{display:"flex",gap:4,marginBottom:8,overflowX:"auto",scrollbarWidth:"none"}}>
          {[["all","Todos"],["over","Over"],["under","Under"],["live",t.lv]].map(([v,l])=>(
            <button key={v} onClick={()=>setFilter(v)} style={{flexShrink:0,padding:"6px 12px",borderRadius:8,border:"none",fontSize:10,fontWeight:600,cursor:"pointer",background:filter===v?`linear-gradient(135deg,${D.ind}33,${D.vi}22)`:D.gl,color:filter===v?D.il:D.mt,outline:filter===v?`1px solid ${D.il}33`:`1px solid ${D.gb}`}}>{l}</button>
          ))}
          <div style={{marginLeft:"auto",display:"flex",gap:4}}>
            {[["conf",t.cf],["edge",t.eg],["time","Hora"]].map(([v,l])=>(
              <button key={v} onClick={()=>setSort(v)} style={{flexShrink:0,padding:"6px 9px",borderRadius:8,border:"none",fontSize:9,fontWeight:600,cursor:"pointer",background:sort===v?`${D.am}22`:D.gl,color:sort===v?D.am:D.mt,outline:sort===v?`1px solid ${D.am}44`:`1px solid ${D.gb}`}}>{l}</button>
            ))}
          </div>
        </div>
      </div>
      <div style={{padding:"0 13px",display:"flex",flexDirection:"column",gap:10}}>
        {opps.map((g,i)=>{
          const H=TMS[g.home],A=TMS[g.away],locked=i>=3&&!isPro;
          return(
            <div key={g.id} style={{borderRadius:18,overflow:"hidden",position:"relative",border:`1px solid ${g.isLive?"rgba(16,185,129,0.3)":D.gb}`,background:D.bg1,animation:`vU 0.3s ${i*.04}s both ease`}}>
              <div style={{height:3,background:`linear-gradient(90deg,${A?.clr||D.mt},${H?.clr||D.ind})`}}/>
              <div style={{padding:"12px 13px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    {g.isLive?<span style={{display:"inline-flex",alignItems:"center",gap:5,background:"rgba(16,185,129,0.12)",border:"1px solid rgba(16,185,129,0.3)",borderRadius:99,padding:"3px 9px",fontSize:9,fontWeight:700,color:D.gr}}><Dot/> {t.lv}</span>:<span style={{background:`${D.ind}14`,border:`1px solid ${D.il}33`,borderRadius:99,padding:"3px 9px",fontSize:9,fontWeight:600,color:D.il}}>{g.time}</span>}
                  </div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <span style={{fontSize:8,fontWeight:700,color:RC[g.p.risk]||D.am,background:`${RC[g.p.risk]||D.am}14`,borderRadius:6,padding:"2px 7px"}}>{t.rk} {g.p.risk}</span>
                    <Ring grade={g.p.grade} conf={g.p.conf} sz={34} D={D}/>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",marginBottom:9}}>
                  {[{tm:A,label:t.aw},null,{tm:H,label:t.hm}].map((x,idx)=>{
                    if(!x) return<div key="at" style={{padding:"0 8px",color:D.mt,fontWeight:700}}>@</div>;
                    return<div key={idx} style={{flex:1,textAlign:"center"}}>
                      <div style={{width:38,height:38,borderRadius:10,margin:"0 auto 5px",background:`${x.tm?.clr||D.mt}22`,border:`1.5px solid ${x.tm?.clr||D.mt}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900,color:x.tm?.clr||D.mt}}>{x.tm?.abbr}</div>
                      <div style={{fontSize:10,fontWeight:700,color:D.tx}}>{x.tm?.name.split(" ").pop()}</div>
                    </div>;
                  })}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:9}}>
                  {[{l:`💵 ${t.ml}`,c:D.ind,m:g.mlR.abbr,v:`${g.mlR.prob}%`,s:g.mlR.line},
                    {l:`📏 ${t.rl}`,c:D.vi,m:`${g.rlR.abbr} −1.5`,v:`${g.rlR.cov}%`,s:"cov."},
                    {l:`⚡ ${t.ou}`,c:g.ouR.rec==="OVER"?D.gr:D.il,m:g.ouR.rec,v:`${g.ouR.prob}%`,s:`L ${g.ouR.line}`}].map(({l,c,m,v,s})=>(
                    <div key={l} style={{background:`${c}0a`,border:`1px solid ${c}22`,borderRadius:11,padding:"9px 7px",textAlign:"center"}}>
                      <div style={{fontSize:7,color:c,fontWeight:700,textTransform:"uppercase",marginBottom:3}}>{l}</div>
                      <div style={{fontSize:11,fontWeight:800,color:D.tx,marginBottom:2}}>{m}</div>
                      <div style={{fontSize:13,fontWeight:900,color:c,marginBottom:2}}>{v}</div>
                      <div style={{fontSize:8,color:D.mt}}>{s}</div>
                    </div>
                  ))}
                </div>
                <div style={{padding:"7px 10px",background:D.gl,border:`1px solid ${D.gb}`,borderRadius:9,marginBottom:8}}>
                  <div style={{fontSize:8,color:D.il,fontWeight:700,textTransform:"uppercase",marginBottom:2}}>🧠 {t.mc} + {t.by_}</div>
                  <div style={{fontSize:10,color:D.sb,lineHeight:1.5}}>{g.reason}</div>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{display:"flex",gap:10}}>
                    <div><div style={{fontSize:12,fontWeight:800,color:D.il}}>{g.p.conf}%</div><div style={{fontSize:7,color:D.mt,textTransform:"uppercase"}}>{t.cf}</div></div>
                    <div><div style={{fontSize:12,fontWeight:800,color:D.gr}}>+{g.p.edge}%</div><div style={{fontSize:7,color:D.mt,textTransform:"uppercase"}}>{t.eg}</div></div>
                    <div><div style={{fontSize:12,fontWeight:800,color:D.am}}>{g.p.proj}R</div><div style={{fontSize:7,color:D.mt,textTransform:"uppercase"}}>{t.pj}</div></div>
                  </div>
                  <button onClick={()=>onSelect(g)} style={{padding:"7px 13px",borderRadius:9,border:`1px solid ${D.il}33`,background:`${D.ind}14`,color:D.il,fontSize:10,fontWeight:700,cursor:"pointer"}}>{t.mr}</button>
                </div>
              </div>
              {locked&&<div style={{position:"absolute",inset:0,background:D===DK?"rgba(10,14,26,0.88)":"rgba(240,244,248,0.88)",backdropFilter:"blur(3px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8}}>
                <div style={{fontSize:22}}>🔒</div>
                <div style={{fontSize:12,fontWeight:700,color:D.tx}}>Plan Pro</div>
                <button style={{padding:"8px 16px",borderRadius:9,border:"none",background:`linear-gradient(135deg,${D.vi},${D.ind})`,color:"white",fontWeight:700,fontSize:11,cursor:"pointer"}}>{t.ap} →</button>
              </div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// STATS
function StatsScreen({D,t}){
  const [div,setDiv]=useState(null);
  const [team,setTeam]=useState(null);
  const [tab,setTab]=useState("sd");
  if(team){
    const tm=TMS[team],wrc=Math.round(95+(tm.ops-.720)*400);
    return(
      <div>
        <div style={{position:"sticky",top:0,zIndex:30,background:D===DK?"rgba(10,14,26,0.97)":"rgba(240,244,248,0.97)",backdropFilter:"blur(24px)",borderBottom:`1px solid ${D.gb}`,padding:"12px 14px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>setTeam(null)} style={{background:D.gl,border:`1px solid ${D.gb}`,borderRadius:9,padding:"6px 11px",color:D.sb,fontSize:12,fontWeight:600,cursor:"pointer"}}>{t.bk}</button>
            <div style={{width:32,height:32,borderRadius:9,background:`${tm.clr}22`,border:`1px solid ${tm.clr}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:tm.clr}}>{tm.abbr}</div>
            <div><div style={{fontSize:13,fontWeight:800,color:D.tx}}>{tm.name}</div><div style={{fontSize:9,color:D.mt}}>{tm.div}</div></div>
          </div>
        </div>
        <div style={{padding:"12px 13px 90px"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7,marginBottom:12}}>
            {[{l:t.W,v:tm.w,c:D.gr},{l:t.LL,v:tm.l,c:D.rd},{l:t.PC,v:`.${(tm.wpct*1000).toFixed(0)}`,c:tm.wpct>=.550?D.gr:D.il},{l:t.sk,v:tm.sk,c:tm.sk.startsWith("G")?D.gr:D.rd}].map(({l,v,c})=>(
              <div key={l} style={{background:D.gl,border:`1px solid ${D.gb}`,borderRadius:10,padding:"9px 6px",textAlign:"center"}}>
                <div style={{fontSize:16,fontWeight:900,color:c}}>{v}</div>
                <div style={{fontSize:7,color:D.mt,textTransform:"uppercase",marginTop:2}}>{l}</div>
              </div>
            ))}
          </div>
          <SL icon="⚾" ch={t.pt} D={D}/>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,marginBottom:12}}>
            {[{l:"ERA",v:tm.era,c:tm.era<3.7?D.gr:tm.era<4.2?D.il:D.mt},{l:"R/J",v:tm.rpg,c:D.sb},{l:t.l10,v:tm.l10,c:parseInt(tm.l10)>=7?D.gr:parseInt(tm.l10)<=3?D.rd:D.sb}].map(({l,v,c})=>(
              <div key={l} style={{background:D.gl,border:`1px solid ${D.gb}`,borderRadius:10,padding:"9px 6px",textAlign:"center"}}>
                <div style={{fontSize:15,fontWeight:900,color:c}}>{v}</div>
                <div style={{fontSize:7,color:D.mt,textTransform:"uppercase",marginTop:2}}>{l}</div>
              </div>
            ))}
          </div>
          <SL icon="🏏" ch={t.of} D={D}/>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6}}>
            {[{l:"OPS",v:`.${(tm.ops*1000).toFixed(0)}`,c:tm.ops>=.760?D.gr:tm.ops>=.730?D.il:D.mt},{l:"wRC+",v:wrc,c:wrc>=115?D.gr:wrc>=100?D.il:D.mt},{l:t.l10,v:tm.l10,c:tm.l10.startsWith("7")||tm.l10.startsWith("8")?D.gr:D.sb}].map(({l,v,c})=>(
              <div key={l} style={{background:D.gl,border:`1px solid ${D.gb}`,borderRadius:10,padding:"9px 6px",textAlign:"center"}}>
                <div style={{fontSize:15,fontWeight:900,color:c}}>{v}</div>
                <div style={{fontSize:7,color:D.mt,textTransform:"uppercase",marginTop:2}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return(
    <div style={{padding:"12px 13px 0"}}>
      <div style={{fontSize:18,fontWeight:900,color:D.tx,marginBottom:3,letterSpacing:"-0.03em"}}>{t.sts}</div>
      <div style={{fontSize:10,color:D.mt,marginBottom:10}}>30 equipos · 2026</div>
      <div style={{display:"flex",gap:3,background:D.gl,borderRadius:10,padding:3,border:`1px solid ${D.gb}`,marginBottom:10}}>
        {[[t.sd,"sd"],[t.pt,"pt"],[t.of,"of"]].map(([l,v])=>(
          <button key={v} onClick={()=>setTab(v)} style={{flex:1,padding:"7px 4px",borderRadius:8,border:"none",fontSize:10,fontWeight:600,cursor:"pointer",background:tab===v?`linear-gradient(135deg,${D.ind}33,${D.vi}22)`:"transparent",color:tab===v?D.il:D.mt,outline:tab===v?`1px solid ${D.il}33`:"none"}}>{l}</button>
        ))}
      </div>
      <div style={{display:"flex",gap:4,overflowX:"auto",scrollbarWidth:"none",marginBottom:10,paddingBottom:2}}>
        <button onClick={()=>setDiv(null)} style={{flexShrink:0,padding:"6px 11px",borderRadius:9,border:"none",fontSize:10,fontWeight:600,cursor:"pointer",background:!div?`linear-gradient(135deg,${D.ind}33,${D.vi}22)`:D.gl,color:!div?D.il:D.mt,outline:!div?`1px solid ${D.il}33`:`1px solid ${D.gb}`}}>All</button>
        {DIVS.map(dv=>(
          <button key={dv} onClick={()=>setDiv(dv)} style={{flexShrink:0,padding:"6px 11px",borderRadius:9,border:"none",fontSize:10,fontWeight:600,cursor:"pointer",background:div===dv?`linear-gradient(135deg,${D.ind}33,${D.vi}22)`:D.gl,color:div===dv?D.il:D.mt,outline:div===dv?`1px solid ${D.il}33`:`1px solid ${D.gb}`}}>{dv}</button>
        ))}
      </div>
      {(div?[div]:DIVS).map(dv=>{
        const teams=Object.values(TMS).filter(tm=>tm.div===dv).sort((a,b)=>b.wpct-a.wpct);
        return(
          <div key={dv} style={{marginBottom:14}}>
            <div style={{fontSize:10,fontWeight:700,color:D.il,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:7,display:"flex",alignItems:"center",gap:6}}>
              <div style={{height:1,width:10,background:`linear-gradient(90deg,${D.ind},transparent)`}}/>{dv}
            </div>
            <div style={{borderRadius:12,overflow:"hidden",border:`1px solid ${D.gb}`}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead><tr style={{background:D.bg2}}>
                  {(tab==="sd"?["Equipo",t.W,t.LL,t.PC]:tab==="pt"?["Equipo","ERA","xERA","WHIP"]:["Equipo","OPS","wRC+",t.l10]).map((h,i)=>(
                    <th key={i} style={{padding:"7px",textAlign:i===0?"left":"center",fontSize:8,color:D.mt,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {teams.map((tm,i)=>{
                    const wrc=Math.round(95+(tm.ops-.720)*400);
                    return(
                      <tr key={tm.abbr} onClick={()=>setTeam(tm.abbr)} style={{background:i%2===0?D.gl:"transparent",borderTop:`1px solid ${D.gb}`,cursor:"pointer"}}>
                        <td style={{padding:"9px 7px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <div style={{width:8,height:8,borderRadius:"50%",background:tm.clr,flexShrink:0}}/>
                            <span style={{fontSize:11,fontWeight:700,color:D.tx}}>{tm.abbr}</span>
                            {i===0&&<span style={{fontSize:7,color:D.gr,background:`${D.gr}14`,border:`1px solid ${D.gr}28`,borderRadius:3,padding:"1px 3px",fontWeight:700}}>1°</span>}
                          </div>
                        </td>
                        {tab==="sd"&&<>
                          <td style={{textAlign:"center",fontSize:11,fontWeight:700,color:D.tx,padding:"9px 5px"}}>{tm.w}</td>
                          <td style={{textAlign:"center",fontSize:11,fontWeight:600,color:D.sb,padding:"9px 5px"}}>{tm.l}</td>
                          <td style={{textAlign:"center",padding:"9px 5px"}}><span style={{fontSize:11,fontWeight:800,color:tm.wpct>=.570?D.gr:tm.wpct>=.500?D.il:D.mt}}>.{(tm.wpct*1000).toFixed(0)}</span></td>
                        </>}
                        {tab==="pt"&&<>
                          <td style={{textAlign:"center",padding:"9px 5px"}}><span style={{fontSize:11,fontWeight:800,color:tm.era<3.7?D.gr:tm.era<4.2?D.il:D.mt}}>{tm.era}</span></td>
                          <td style={{textAlign:"center",fontSize:11,fontWeight:600,color:D.sb,padding:"9px 5px"}}>{(tm.era+.12).toFixed(2)}</td>
                          <td style={{textAlign:"center",fontSize:11,fontWeight:600,color:D.sb,padding:"9px 5px"}}>{(1.18+(tm.era-3.5)*.08).toFixed(2)}</td>
                        </>}
                        {tab==="of"&&<>
                          <td style={{textAlign:"center",padding:"9px 5px"}}><span style={{fontSize:11,fontWeight:800,color:tm.ops>=.760?D.gr:tm.ops>=.730?D.il:D.mt}}>.{(tm.ops*1000).toFixed(0)}</span></td>
                          <td style={{textAlign:"center",padding:"9px 5px"}}><span style={{fontSize:11,fontWeight:800,color:wrc>=115?D.gr:wrc>=100?D.il:D.mt}}>{wrc}</span></td>
                          <td style={{textAlign:"center",fontSize:11,fontWeight:600,color:D.sb,padding:"9px 5px"}}>{tm.l10}</td>
                        </>}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// AXE CHAT
function AxeChat({dark,D,t,onClose,userPlan,lang}){
  const lim=PLANS[userPlan]?.axe||10;
  const AXE_GREET={es:"Hola! Soy Axe, tu asistente MLB. Puedo ayudarte con estadisticas, predicciones y planes.",en:"Hi! I'm Axe, your MLB assistant. I can help with stats, predictions and plans!",pt:"Ola! Sou Axe. Posso ajudar com baseball e predicoes.",fr:"Bonjour! Je suis Axe. Comment puis-je vous aider?",it:"Ciao! Sono Axe il tuo assistente MLB.",de:"Hallo! Ich bin Axe, Ihr MLB-Assistent.",ja:"こんにちは！アシスタントAxeです。",ko:"안녕하세요! 어시스턴트 Axe입니다.",zh:"你好！我是助手Axe。"};
  const [msgs,setMsgs]=useState([{id:1,u:false,text:AXE_GREET[lang]||AXE_GREET["en"]}]);
  const [input,setInput]=useState("");
  const [typing,setTyping]=useState(false);
  const [q,setQ]=useState(0);
  const endRef=useRef(null);
  useEffect(()=>endRef.current?.scrollIntoView({behavior:"smooth"}),[msgs,typing]);
  const atLim=q>=lim;
  const QUICK=lang==="en"
    ?["What is Moneyline?","How does Over/Under work?","What is wRC+?","What does Pro include?"]
    :["¿Qué es el Moneyline?","¿Cómo funciona el Over/Under?","¿Qué es el wRC+?","¿Qué incluye el Plan Pro?"];
  const send=async(text=input)=>{
    if(!text.trim()||atLim) return;
    setMsgs(m=>[...m,{id:Date.now(),u:true,text}]);setInput("");setTyping(true);setQ(x=>x+1);
    const r=await askAxe(text,msgs,lang);
    setMsgs(m=>[...m,{id:Date.now()+1,u:false,text:r}]);setTyping(false);
  };
  return(
    <div style={{position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"flex-end",justifyContent:"center",background:"rgba(0,0,0,0.6)",backdropFilter:"blur(6px)"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{width:"100%",maxWidth:480,height:"78vh",background:dark?"rgba(10,14,26,0.99)":"rgba(255,255,255,0.99)",borderRadius:"22px 22px 0 0",border:`1px solid ${D.gb}`,borderBottom:"none",display:"flex",flexDirection:"column",animation:"vSU 0.3s ease"}}>
        <div style={{width:36,height:4,borderRadius:99,background:"rgba(255,255,255,0.15)",margin:"12px auto 0"}}/>
        <div style={{padding:"12px 16px 10px",borderBottom:`1px solid ${D.gb}`,display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:38,height:38,borderRadius:11,background:`linear-gradient(135deg,${D.ind},${D.vi})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🤖</div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:800,color:D.tx}}>Axe — MLBEdge</div>
            <div style={{fontSize:10,color:D.gr,display:"flex",alignItems:"center",gap:4}}><Dot c={D.gr}/> {t.ao} · {lim===Infinity?"∞":`${q}/${lim}`}</div>
          </div>
          <button onClick={onClose} style={{background:D.gl,border:`1px solid ${D.gb}`,borderRadius:8,padding:"5px 10px",color:D.sb,cursor:"pointer",fontSize:13}}>✕</button>
        </div>
        {msgs.length<=1&&<div style={{padding:"10px 14px",borderBottom:`1px solid ${D.gb}`}}>
          <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
            {QUICK.map((q2,i)=><button key={i} onClick={()=>send(q2)} style={{background:`${D.ind}14`,border:`1px solid ${D.il}33`,borderRadius:7,padding:"5px 9px",color:D.il,fontSize:9,fontWeight:600,cursor:"pointer"}}>{q2}</button>)}
          </div>
        </div>}
        <div style={{flex:1,overflowY:"auto",padding:"12px 14px",display:"flex",flexDirection:"column",gap:9}}>
          {msgs.map(m=>(
            <div key={m.id} style={{display:"flex",justifyContent:m.u?"flex-end":"flex-start",animation:"vU 0.25s ease"}}>
              {!m.u&&<div style={{width:26,height:26,borderRadius:7,background:`linear-gradient(135deg,${D.ind},${D.vi})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,marginRight:6,flexShrink:0,alignSelf:"flex-end"}}>🤖</div>}
              <div style={{maxWidth:"78%",padding:"9px 12px",borderRadius:m.u?"13px 13px 4px 13px":"13px 13px 13px 4px",background:m.u?`linear-gradient(135deg,${D.ind},${D.vi})`:D.gl,border:m.u?"none":`1px solid ${D.gb}`}}>
                <div style={{fontSize:12,color:m.u?"white":D.tx,lineHeight:1.65}}>{m.text}</div>
                <div style={{fontSize:8,color:m.u?"rgba(255,255,255,0.5)":D.mt,marginTop:3}}>{m.u?"✓✓":"Axe"}</div>
              </div>
            </div>
          ))}
          {typing&&<div style={{display:"flex",gap:6,alignItems:"center"}}>
            <div style={{width:26,height:26,borderRadius:7,background:`linear-gradient(135deg,${D.ind},${D.vi})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>🤖</div>
            <div style={{padding:"9px 13px",background:D.gl,border:`1px solid ${D.gb}`,borderRadius:"13px 13px 13px 4px",display:"flex",gap:3,alignItems:"center"}}>
              {[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:D.il,animation:`vB 0.6s ${i*.15}s ease infinite`}}/>)}
            </div>
          </div>}
          <div ref={endRef}/>
        </div>
        {atLim&&<div style={{padding:"8px 14px",background:`${D.am}0a`,borderTop:`1px solid ${D.am}22`,textAlign:"center",fontSize:10,color:D.am,fontWeight:600}}>Límite diario alcanzado · Actualiza tu plan</div>}
        <div style={{padding:"10px 14px 16px",borderTop:`1px solid ${D.gb}`,display:"flex",gap:7}}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} disabled={atLim} placeholder={t.aq} style={{flex:1,padding:"10px 13px",background:D.gl,border:`1px solid ${D.gb}`,borderRadius:11,color:D.tx,fontSize:12,outline:"none",opacity:atLim?0.5:1}}/>
          <button onClick={()=>send()} disabled={!input.trim()||typing||atLim} style={{width:40,height:40,borderRadius:10,border:"none",background:input.trim()&&!typing&&!atLim?`linear-gradient(135deg,${D.ind},${D.vi})`:"rgba(255,255,255,0.1)",color:input.trim()&&!typing&&!atLim?"white":D.mt,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>→</button>
        </div>
      </div>
    </div>
  );
}

// NOTIFICATIONS
function NotifCenter({D,t,onClose}){
  const [notifs,setNotifs]=useState([
    {id:1,icon:"🔴",title:"Partido En Vivo",body:"Datos MLB en tiempo real activos",time:"Ahora",read:false,c:"#10b981"},
    {id:2,icon:"🧠",title:"Modelo Avanzado",body:"Monte Carlo + Bayesiano · 3,000 simulaciones",time:"Hace 3 min",read:false,c:"#6366f1"},
    {id:3,icon:"🌍",title:"9 Idiomas Disponibles",body:"Cambia el idioma en ⚙️ Configuración",time:"Hace 5 min",read:false,c:"#8b5cf6"},
    {id:4,icon:"💰",title:"Nuevos Precios",body:"Starter $1.99 · Pro $4.99 · Premium $9.99",time:"Hoy",read:true,c:"#10b981"},
  ]);
  return(
    <div style={{position:"fixed",inset:0,zIndex:100,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{width:"100%",maxWidth:480,background:D===DK?"rgba(10,14,26,0.99)":"rgba(255,255,255,0.99)",borderRadius:"22px 22px 0 0",border:`1px solid ${D.gb}`,borderBottom:"none",maxHeight:"80vh",display:"flex",flexDirection:"column",animation:"vSU 0.3s ease"}}>
        <div style={{width:36,height:4,borderRadius:99,background:"rgba(255,255,255,0.15)",margin:"12px auto 0"}}/>
        <div style={{padding:"14px 16px",borderBottom:`1px solid ${D.gb}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:16,fontWeight:900,color:D.tx}}>
            {t.nt} <span style={{background:D.rd,color:"white",fontSize:10,fontWeight:700,borderRadius:99,padding:"1px 6px",marginLeft:6}}>{notifs.filter(n=>!n.read).length}</span>
          </div>
          <div style={{display:"flex",gap:7}}>
            <button onClick={()=>setNotifs(n=>n.map(x=>({...x,read:true})))} style={{background:D.gl,border:`1px solid ${D.gb}`,borderRadius:7,padding:"5px 9px",color:D.il,fontSize:10,fontWeight:600,cursor:"pointer"}}>{t.ra}</button>
            <button onClick={onClose} style={{background:D.gl,border:`1px solid ${D.gb}`,borderRadius:7,padding:"5px 9px",color:D.sb,fontSize:13,cursor:"pointer"}}>✕</button>
          </div>
        </div>
        <div style={{overflowY:"auto",flex:1}}>
          {notifs.map(n=>(
            <div key={n.id} onClick={()=>setNotifs(ns=>ns.map(x=>x.id===n.id?{...x,read:true}:x))} style={{display:"flex",gap:11,padding:"12px 16px",cursor:"pointer",background:!n.read?`${n.c}08`:"transparent",borderBottom:`1px solid ${D.gb}`}}>
              <div style={{width:38,height:38,borderRadius:11,background:`${n.c}18`,border:`1px solid ${n.c}28`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0,position:"relative"}}>
                {n.icon}{!n.read&&<div style={{position:"absolute",top:-2,right:-2,width:8,height:8,borderRadius:"50%",background:n.c,border:`1.5px solid ${D.bg0}`}}/>}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:!n.read?800:600,color:D.tx,marginBottom:2}}>{n.title}</div>
                <div style={{fontSize:10,color:D.sb,lineHeight:1.4,marginBottom:3}}>{n.body}</div>
                <div style={{fontSize:9,color:D.mt}}>{n.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// FEEDBACK / CENTRO DE SUGERENCIAS
function FeedbackModal({D,t,onClose}){
  const [type,setType]=useState("sg2");
  const [rating,setRating]=useState(0);
  const [text,setText]=useState("");
  const [loading,setLoading]=useState(false);
  const [done,setDone]=useState(false);
  if(done) return(
    <div style={{position:"fixed",inset:0,zIndex:100,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:D===DK?"rgba(10,14,26,0.99)":"white",borderRadius:20,padding:"40px 24px",textAlign:"center",maxWidth:340,width:"100%",border:`1px solid ${D.gb}`,animation:"vU 0.3s ease"}}>
        <div style={{fontSize:48,marginBottom:14}}>✅</div>
        <div style={{fontSize:17,fontWeight:800,color:D.tx,marginBottom:8}}>{t.tk}</div>
        <div style={{fontSize:12,color:D.sb,lineHeight:1.6,marginBottom:20}}>{t.fs}</div>
        <button onClick={onClose} style={{padding:"11px 28px",borderRadius:11,border:"none",background:`linear-gradient(135deg,${D.ind},${D.vi})`,color:"white",fontWeight:700,fontSize:13,cursor:"pointer"}}>OK</button>
      </div>
    </div>
  );
  return(
    <div style={{position:"fixed",inset:0,zIndex:100,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{width:"100%",maxWidth:480,background:D===DK?"rgba(10,14,26,0.99)":"rgba(255,255,255,0.99)",borderRadius:"22px 22px 0 0",border:`1px solid ${D.gb}`,borderBottom:"none",padding:"0 0 24px",animation:"vSU 0.3s ease"}}>
        <div style={{width:36,height:4,borderRadius:99,background:"rgba(255,255,255,0.15)",margin:"12px auto 0"}}/>
        <div style={{padding:"14px 16px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:16,fontWeight:900,color:D.tx}}>{t.fb}</div>
            <button onClick={onClose} style={{background:D.gl,border:`1px solid ${D.gb}`,borderRadius:7,padding:"5px 9px",color:D.sb,cursor:"pointer",fontSize:13}}>✕</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:14}}>
            {[{id:"sg2",icon:"💡",l:t.sg2},{id:"bg",icon:"🐛",l:t.bg},{id:"ft",icon:"✨",l:t.ft},{id:"cm",icon:"💬",l:t.cm}].map(tp=>(
              <button key={tp.id} onClick={()=>setType(tp.id)} style={{padding:"11px",borderRadius:11,border:"none",cursor:"pointer",background:type===tp.id?`linear-gradient(135deg,${D.ind}33,${D.vi}22)`:D.gl,outline:type===tp.id?`1px solid ${D.il}44`:`1px solid ${D.gb}`,display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
                <span style={{fontSize:18}}>{tp.icon}</span>
                <span style={{fontSize:10,fontWeight:type===tp.id?700:500,color:type===tp.id?D.il:D.sb}}>{tp.l}</span>
              </button>
            ))}
          </div>
          <div style={{display:"flex",gap:5,marginBottom:12}}>
            {[1,2,3,4,5].map(s=><button key={s} onClick={()=>setRating(s)} style={{fontSize:24,background:"transparent",border:"none",cursor:"pointer",filter:s<=rating?"none":"grayscale(1) opacity(0.3)",transition:"all 0.15s"}}>⭐</button>)}
          </div>
          <textarea value={text} onChange={e=>setText(e.target.value)} placeholder={`${t.ds} ${t[type]||t.sg2}...`} rows={4} style={{width:"100%",padding:"11px 13px",background:D.gl,border:`1px solid ${D.gb}`,borderRadius:11,color:D.tx,fontSize:12,outline:"none",resize:"none",lineHeight:1.6,fontFamily:"inherit",marginBottom:12}}/>
          <button onClick={async()=>{if(!text.trim()) return;setLoading(true);await new Promise(r=>setTimeout(r,1400));setLoading(false);setDone(true);}} disabled={!text.trim()||loading} style={{width:"100%",padding:"12px",borderRadius:12,border:"none",cursor:"pointer",background:text.trim()?`linear-gradient(135deg,${D.ind},${D.vi})`:"rgba(255,255,255,0.08)",color:text.trim()?"white":D.mt,fontWeight:700,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
            {loading?<><Sp/>{t.sg}...</>:`${t.snd} →`}
          </button>
        </div>
      </div>
    </div>
  );
}

// PRICING
function PricingScreen({D,t,userPlan,onSelect,onBack}){
  return(
    <div style={{minHeight:"100vh",background:D.bg0}}>
      <div style={{position:"sticky",top:0,zIndex:30,background:D===DK?"rgba(10,14,26,0.97)":"rgba(240,244,248,0.97)",backdropFilter:"blur(24px)",borderBottom:`1px solid ${D.gb}`,padding:"12px 14px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {onBack&&<button onClick={onBack} style={{background:D.gl,border:`1px solid ${D.gb}`,borderRadius:10,padding:"7px 12px",color:D.sb,fontSize:12,fontWeight:600,cursor:"pointer"}}>{t.bk}</button>}
          <div><div style={{fontSize:16,fontWeight:900,color:D.tx}}>{t.cp}</div><div style={{fontSize:10,color:D.mt}}>MLBEdge · {t.tr}</div></div>
        </div>
      </div>
      <div style={{padding:"14px 13px 90px"}}>
        <div style={{marginBottom:14,padding:"14px",background:`linear-gradient(135deg,${D.ind}14,${D.vi}0a)`,border:`1px solid ${D.il}22`,borderRadius:16,textAlign:"center"}}>
          <div style={{fontSize:20}}>⚾</div>
          <div style={{fontSize:13,fontWeight:800,color:D.tx,marginTop:6,marginBottom:3}}>MLBEdge</div>
          <div style={{fontSize:10,color:D.sb}}>{t.tr} · Sin tarjeta de crédito</div>
        </div>
        {Object.entries(PLANS).map(([key,plan],i)=>(
          <div key={key} style={{marginBottom:12,borderRadius:20,overflow:"hidden",border:`1px solid ${plan.popular?"rgba(139,92,246,0.4)":D.gb}`,background:plan.popular?D===DK?`linear-gradient(135deg,rgba(139,92,246,0.1),rgba(99,102,241,0.06))`:`linear-gradient(135deg,rgba(139,92,246,0.06),rgba(99,102,241,0.03))`:D.bg1,animation:`vU 0.3s ${i*.08}s both ease`}}>
            {plan.popular&&<div style={{height:2,background:`linear-gradient(90deg,${plan.clr}00,${plan.clr},${plan.clr}00)`}}/>}
            <div style={{padding:"16px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
                    <div style={{fontSize:15,fontWeight:800,color:plan.clr}}>{plan.n}</div>
                    {userPlan===key&&<span style={{fontSize:8,fontWeight:700,color:plan.clr,background:`${plan.clr}18`,border:`1px solid ${plan.clr}33`,borderRadius:6,padding:"2px 7px"}}>{t.ac}</span>}
                    {plan.popular&&userPlan!==key&&<span style={{fontSize:8,fontWeight:700,color:plan.clr,background:`${plan.clr}18`,border:`1px solid ${plan.clr}33`,borderRadius:6,padding:"2px 7px"}}>⭐ TOP</span>}
                  </div>
                  <div style={{display:"flex",alignItems:"baseline",gap:3,marginBottom:2}}>
                    <div style={{fontSize:28,fontWeight:900,color:D.tx}}>{plan.p}</div>
                    <div style={{fontSize:12,color:D.mt}}>{t.pm}</div>
                  </div>
                  <div style={{fontSize:10,color:D.gr,fontWeight:600}}>✓ {t.tr}</div>
                </div>
                <div style={{fontSize:28}}>{key==="starter"?"⚾":key==="pro"?"🚀":"⭐"}</div>
              </div>
              <div style={{height:1,background:`${plan.clr}22`,marginBottom:10}}/>
              {plan.features.map((f,j)=>(
                <div key={j} style={{display:"flex",gap:7,marginBottom:5}}><span style={{color:plan.clr,fontSize:11,flexShrink:0}}>✓</span><span style={{fontSize:11,color:D.sb}}>{f}</span></div>
              ))}
              <button onClick={()=>onSelect(key)} style={{width:"100%",padding:"12px",marginTop:10,borderRadius:12,border:userPlan===key?`1px solid ${D.gb}`:"none",cursor:"pointer",background:userPlan===key?D.gl:`linear-gradient(135deg,${plan.clr},${plan.clr}cc)`,color:userPlan===key?D.mt:"white",fontWeight:700,fontSize:13}}>
                {userPlan===key?t.cu:key==="starter"?t.sf:key==="pro"?t.cp2:t.cp3}
              </button>
            </div>
          </div>
        ))}
        <div style={{marginTop:4,padding:"14px",background:D.gl,border:`1px solid ${D.gb}`,borderRadius:14}}>
          <div style={{fontSize:11,fontWeight:700,color:D.tx,marginBottom:10}}>{t.fq}</div>
          {[[t.q1,t.a1],[t.q2,t.a2],[t.q3,t.a3]].map(([q,a],i)=>(
            <div key={i} style={{marginBottom:i<2?10:0}}>
              <div style={{fontSize:11,fontWeight:600,color:D.tx,marginBottom:3}}>{q}</div>
              <div style={{fontSize:10,color:D.sb,lineHeight:1.5}}>{a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// SETTINGS
function SettingsScreen({dark,setDark,lang,setLang,D,t,onBack}){
  const [tmpDark,setTmpDark]=useState(dark);
  const [tmpLang,setTmpLang]=useState(lang);
  const [saved,setSaved]=useState(false);
  const changed=tmpDark!==dark||tmpLang!==lang;
  const doSave=()=>{
    setDark(tmpDark);
    setLang(tmpLang);
    try{localStorage.setItem("mlb_dark",String(tmpDark));}catch(e){}
    try{localStorage.setItem("mlb_lang",tmpLang);}catch(e){}
    setSaved(true);
    setTimeout(()=>setSaved(false),2500);
  };
  return(
    <div style={{minHeight:"100vh",background:D.bg0}}>
      <div style={{position:"sticky",top:0,zIndex:30,background:D===DK?"rgba(10,14,26,0.97)":"rgba(240,244,248,0.97)",backdropFilter:"blur(24px)",borderBottom:`1px solid ${D.gb}`,padding:"12px 14px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={onBack} style={{background:D.gl,border:`1px solid ${D.gb}`,borderRadius:10,padding:"7px 12px",color:D.sb,fontSize:12,fontWeight:600,cursor:"pointer"}}>{t.bk}</button>
          <div style={{flex:1,fontSize:16,fontWeight:800,color:D.tx}}>⚙️ {t.cfg}</div>
          {saved&&<div style={{fontSize:10,color:D.gr,fontWeight:700,background:D.gr+"18",border:"1px solid "+D.gr+"33",borderRadius:8,padding:"4px 10px"}}>{t.savedMsg||"Guardado"}</div>}
        </div>
      </div>
      <div style={{padding:"16px 13px 24px"}}>
        <div style={{background:D.gl,border:`1px solid ${D.gb}`,borderRadius:14,padding:"14px",marginBottom:12}}>
          <SL icon="🎨" ch={t.th} D={D}/>
          <div style={{display:"flex",gap:8}}>
            {[{v:true,l:t.dm,i:"🌙"},{v:false,l:t.lm,i:"☀️"}].map(({v,l,i})=>(
              <button key={String(v)} onClick={()=>setTmpDark(v)} style={{flex:1,padding:"12px",borderRadius:11,border:"none",cursor:"pointer",background:tmpDark===v?`linear-gradient(135deg,${D.ind}33,${D.vi}22)`:D.gl,color:tmpDark===v?D.il:D.mt,outline:tmpDark===v?`1px solid ${D.il}33`:`1px solid ${D.gb}`,fontWeight:tmpDark===v?700:500,fontSize:12,display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
                <span style={{fontSize:20}}>{i}</span>{l}
              </button>
            ))}
          </div>
        </div>
        <div style={{background:D.gl,border:`1px solid ${D.gb}`,borderRadius:14,padding:"14px",marginBottom:14}}>
          <SL icon="🌍" ch={t.lg} D={D}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
            {Object.entries(LANGS).map(([lc,{f,n}])=>(
              <button key={lc} onClick={()=>setTmpLang(lc)} style={{padding:"10px 6px",borderRadius:10,border:"none",cursor:"pointer",background:tmpLang===lc?`linear-gradient(135deg,${D.ind}33,${D.vi}22)`:D.gl,color:tmpLang===lc?D.il:D.mt,outline:tmpLang===lc?`1px solid ${D.il}33`:`1px solid ${D.gb}`,fontWeight:tmpLang===lc?700:500,fontSize:10,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <span style={{fontSize:18}}>{f}</span>
                <span style={{fontSize:8,letterSpacing:"0.03em"}}>{n}</span>
              </button>
            ))}
          </div>
        </div>
        <button onClick={doSave} style={{width:"100%",padding:"14px",borderRadius:13,border:"none",cursor:"pointer",background:changed?`linear-gradient(135deg,${D.ind},${D.vi})`:"rgba(255,255,255,0.08)",color:changed?"white":D.mt,fontWeight:700,fontSize:14,transition:"all 0.2s"}}>
          {saved?(t.savedMsg||"Guardado"):(t.saveBtn||"Guardar cambios")}
        </button>
        {changed&&!saved&&<div style={{textAlign:"center",fontSize:10,color:D.am,marginTop:8}}>{t.unsaved||"Cambios sin guardar"}</div>}
      </div>
    </div>
  );
}


// PROFILE
function ProfileScreen({D,t,user,userPlan,onChangePlan,onLogout,onFeedback}){
  const plan=PLANS[userPlan];
  const [confirm,setConfirm]=useState(false);
  return(
    <div style={{padding:"12px 13px 0"}}>
      <div style={{background:`linear-gradient(135deg,${plan.clr}18,${plan.clr}08)`,border:`1px solid ${plan.clr}28`,borderRadius:18,padding:"18px",marginBottom:12,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${plan.clr},transparent)`}}/>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
          <div style={{width:52,height:52,borderRadius:14,background:`${plan.clr}22`,border:`1px solid ${plan.clr}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>⚾</div>
          <div>
            <div style={{fontSize:14,fontWeight:800,color:D.tx,marginBottom:3}}>{user?.email||"Usuario"}</div>
            <span style={{background:`${plan.clr}22`,border:`1px solid ${plan.clr}33`,borderRadius:6,padding:"2px 9px",fontSize:8,fontWeight:800,color:plan.clr,letterSpacing:"0.1em"}}>{plan.n.toUpperCase()}</span>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7}}>
          {[{l:t.mp,v:plan.n,c:plan.clr},{l:t.pm.replace("/",""),v:plan.p,c:D.tx},{l:"Axe",v:plan.axe===Infinity?"∞":`${plan.axe}/día`,c:D.il}].map(s=>(
            <div key={s.l} style={{background:D.gl,border:`1px solid ${D.gb}`,borderRadius:10,padding:"9px 6px",textAlign:"center"}}>
              <div style={{fontSize:13,fontWeight:800,color:s.c}}>{s.v}</div>
              <div style={{fontSize:7,color:D.mt,marginTop:2,textTransform:"uppercase"}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
      {userPlan!=="premium"&&<button onClick={onChangePlan} style={{width:"100%",padding:"13px",borderRadius:13,border:`1px solid ${D.il}33`,background:`linear-gradient(135deg,${D.ind}22,${D.vi}14)`,color:D.il,fontWeight:700,fontSize:13,cursor:"pointer",marginBottom:8}}>🚀 {t.ap}</button>}
      <button onClick={onFeedback} style={{width:"100%",padding:"11px",borderRadius:12,border:`1px solid ${D.gb}`,background:D.gl,color:D.sb,fontWeight:600,fontSize:12,cursor:"pointer",marginBottom:8}}>💡 {t.fb}</button>
      {!confirm
        ?<button onClick={()=>setConfirm(true)} style={{width:"100%",padding:"11px",borderRadius:12,border:`1px solid ${D.gb}`,background:D.gl,color:D.mt,fontWeight:600,fontSize:12,cursor:"pointer",marginBottom:12}}>{t.lo2}</button>
        :<div style={{background:D.rd+"08",border:`1px solid ${D.rd}28`,borderRadius:12,padding:"14px",marginBottom:12}}>
          <div style={{fontSize:12,fontWeight:700,color:D.tx,textAlign:"center",marginBottom:4}}>{t.confirmLogoutQ||"Cerrar sesion?"}</div>
          <div style={{fontSize:10,color:D.mt,textAlign:"center",marginBottom:12}}>{t.confirmLogoutMsg||"Necesitaras iniciar sesion de nuevo con Google."}</div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>setConfirm(false)} style={{flex:1,padding:"10px",borderRadius:10,border:`1px solid ${D.gb}`,background:D.gl,color:D.sb,fontWeight:600,fontSize:12,cursor:"pointer"}}>{t.cancelBtn||"Cancelar"}</button>
            <button onClick={onLogout} style={{flex:1,padding:"10px",borderRadius:10,border:"none",background:D.rd,color:"white",fontWeight:700,fontSize:12,cursor:"pointer"}}>{t.closeAcc||"Cerrar sesion"}</button>
          </div>
        </div>
      }
      <div style={{textAlign:"center",fontSize:8,color:D.mt,lineHeight:2,textTransform:"uppercase"}}>MLBEdge · +21</div>
    </div>
  );
}

// CALENDARIO COMPLETO
function CalendarScreen({games,onSelect,D,t}){
  const today=new Date();
  const [yr,setYr]=useState(today.getFullYear());
  const [mo,setMo]=useState(today.getMonth());
  const [day,setDay]=useState(today.getDate());
  const [showPicker,setShowPicker]=useState(false);
  const [view,setView]=useState("all");

  const MON=(t.months||"Ene,Feb,Mar,Abr,May,Jun,Jul,Ago,Sep,Oct,Nov,Dic").split(",");
  const WD=(t.wdays||"Dom,Lun,Mar,Mie,Jue,Vie,Sab").split(",");
  const MONFULL=[t.jan||MON[0],t.feb||MON[1],t.mar||MON[2],t.apr||MON[3],t.may2||MON[4],t.jun||MON[5],t.jul||MON[6],t.aug||MON[7],t.sep||MON[8],t.oct||MON[9],t.nov||MON[10],t.dec||MON[11]];

  const firstDay=new Date(yr,mo,1).getDay();
  const daysInMo=new Date(yr,mo+1,0).getDate();
  const cells=[];
  for(let i=0;i<firstDay;i++) cells.push(null);
  for(let i=1;i<=daysInMo;i++) cells.push(i);

  const prevMo=()=>{if(mo===0){setMo(11);setYr(y=>y-1);}else setMo(m=>m-1);};
  const nextMo=()=>{if(mo===11){setMo(0);setYr(y=>y+1);}else setMo(m=>m+1);};
  const goToday=()=>{setYr(today.getFullYear());setMo(today.getMonth());setDay(today.getDate());};

  const isToday=(d)=>yr===today.getFullYear()&&mo===today.getMonth()&&d===today.getDate();
  const isSel=(d)=>d===day&&yr===today.getFullYear()&&mo===today.getMonth();

  const filtered=games.filter(g=>{
    if(view==="live") return g.isLive;
    if(view==="upcoming") return !g.isFinal&&!g.isLive;
    if(view==="finished") return g.isFinal;
    return true;
  });

  const liveN=games.filter(g=>g.isLive).length;
  const upN=games.filter(g=>!g.isFinal&&!g.isLive).length;
  const dnN=games.filter(g=>g.isFinal).length;

  return(
    <div style={{paddingBottom:90}}>
      <div style={{padding:"12px 13px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontSize:20,fontWeight:900,color:D.tx,letterSpacing:"-0.03em"}}>{t.cal}</div>
          <button onClick={goToday} style={{background:D.ind+"22",border:"1px solid "+D.il+"33",borderRadius:8,padding:"5px 11px",color:D.il,fontSize:10,fontWeight:700,cursor:"pointer"}}>{t.today||"Hoy"}</button>
        </div>
        <div style={{background:D.gl,border:`1px solid ${D.gb}`,borderRadius:14,padding:"12px",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <button onClick={prevMo} style={{width:32,height:32,borderRadius:8,border:`1px solid ${D.gb}`,background:D.gl,color:D.tx,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{"<"}</button>
            <button onClick={()=>setShowPicker(v=>!v)} style={{flex:1,margin:"0 8px",padding:"6px",borderRadius:9,border:`1px solid ${D.gb}`,background:showPicker?D.ind+"22":D.gl,cursor:"pointer",textAlign:"center"}}>
              <div style={{fontSize:15,fontWeight:800,color:showPicker?D.il:D.tx}}>{MONFULL[mo]}</div>
              <div style={{fontSize:11,color:D.mt}}>{yr}</div>
            </button>
            <button onClick={nextMo} style={{width:32,height:32,borderRadius:8,border:`1px solid ${D.gb}`,background:D.gl,color:D.tx,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{">"}</button>
          </div>
          {showPicker&&(
            <div style={{marginBottom:10}}>
              <div style={{display:"flex",gap:4,justifyContent:"center",flexWrap:"wrap",marginBottom:8}}>
                {[yr-2,yr-1,yr,yr+1,yr+2].map(y=>(
                  <button key={y} onClick={()=>{setYr(y);setShowPicker(false);}} style={{padding:"5px 10px",borderRadius:7,border:"none",cursor:"pointer",background:y===yr?`linear-gradient(135deg,${D.ind},${D.vi})`:D.gl,color:y===yr?"white":D.mt,fontSize:12,fontWeight:y===yr?700:400}}>
                    {y}
                  </button>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4}}>
                {MON.map((m,i)=>(
                  <button key={i} onClick={()=>{setMo(i);setShowPicker(false);}} style={{padding:"6px 4px",borderRadius:7,border:"none",cursor:"pointer",background:i===mo?`linear-gradient(135deg,${D.ind},${D.vi})`:D.gl,color:i===mo?"white":D.mt,fontSize:10,fontWeight:i===mo?700:400}}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",marginBottom:4}}>
            {WD.map((d,i)=><div key={i} style={{textAlign:"center",fontSize:8,fontWeight:700,color:D.mt,padding:"2px 0"}}>{d}</div>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
            {cells.map((d,i)=>{
              if(!d) return <div key={"e"+i}/>;
              const tod=isToday(d);
              const sel=isSel(d);
              return(
                <button key={d} onClick={()=>setDay(d)} style={{aspectRatio:"1",borderRadius:8,border:"none",cursor:"pointer",background:sel?`linear-gradient(135deg,${D.ind},${D.vi})`:tod?D.ind+"22":D.gl,color:sel?"white":tod?D.il:D.tx,fontSize:12,fontWeight:sel||tod?700:400,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
                  {d}
                  {tod&&!sel&&<div style={{position:"absolute",bottom:2,left:"50%",transform:"translateX(-50%)",width:3,height:3,borderRadius:"50%",background:D.il}}/>}
                </button>
              );
            })}
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6,marginBottom:10}}>
          {[
            {v:"all",l:t.allGames||"Todos",n:games.length,c:D.il},
            {v:"live",l:t.lv,n:liveN,c:D.gr},
            {v:"upcoming",l:t.upcoming||"Proximos",n:upN,c:D.am},
            {v:"finished",l:t.finished||"Final",n:dnN,c:D.mt},
          ].map(({v,l,n,c})=>(
            <button key={v} onClick={()=>setView(v)} style={{padding:"8px 4px",borderRadius:10,border:"none",cursor:"pointer",background:view===v?c+"22":"transparent",outline:view===v?"1px solid "+c+"44":"1px solid "+D.gb}}>
              <div style={{fontSize:16,fontWeight:900,color:view===v?c:D.tx}}>{n}</div>
              <div style={{fontSize:7,color:view===v?c:D.mt,fontWeight:600,textTransform:"uppercase",marginTop:2}}>{l}</div>
            </button>
          ))}
        </div>
      </div>
      <div style={{padding:"0 13px",display:"flex",flexDirection:"column",gap:9}}>
        {filtered.length===0&&(
          <div style={{textAlign:"center",padding:"40px 20px",background:D.gl,borderRadius:16,border:`1px solid ${D.gb}`}}>
            <div style={{fontSize:36,marginBottom:10}}>📅</div>
            <div style={{fontSize:13,fontWeight:700,color:D.tx,marginBottom:4}}>{t.noGames2||"Sin partidos"}</div>
            <div style={{fontSize:11,color:D.mt}}>{t.noGamesDesc||"No hay juegos"}</div>
          </div>
        )}
        {filtered.map((g,i)=><GameCard key={g.id} game={g} idx={i} onSelect={onSelect} D={D} t={t}/>)}
      </div>
    </div>
  );
}

// BOTTOM NAV
function Nav({active,onChange,badge,D,t,onCfg}){
  const tabs=[{id:"calendar",icon:"📅",l:t.cal},{id:"opps",icon:"⭐",l:t.opp,b:badge},{id:"stats",icon:"📊",l:t.sts},{id:"profile",icon:"👤",l:t.prf}];
  return(
    <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,zIndex:50,background:D===DK?"rgba(10,14,26,0.97)":"rgba(255,255,255,0.97)",backdropFilter:"blur(32px)",WebkitBackdropFilter:"blur(32px)",borderTop:`1px solid ${D.gb}`,display:"flex",paddingBottom:"env(safe-area-inset-bottom,6px)"}}>
      {tabs.map(tab=>{const isA=active===tab.id;return(
        <button key={tab.id} onClick={()=>onChange(tab.id)} style={{flex:1,padding:"10px 4px 7px",border:"none",background:"transparent",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,position:"relative"}}>
          {isA&&<div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:24,height:2,borderRadius:"0 0 2px 2px",background:`linear-gradient(90deg,${D.ind},${D.vi})`,boxShadow:`0 0 8px ${D.ind}88`}}/>}
          {tab.b>0&&<div style={{position:"absolute",top:6,right:"calc(50% - 18px)",background:D.gr,color:"#000",fontSize:7,fontWeight:800,minWidth:13,height:13,borderRadius:99,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 2px",border:`1.5px solid ${D.bg0}`}}>{tab.b}</div>}
          <span style={{fontSize:19,filter:isA?"none":"grayscale(1) opacity(0.4)",transition:"filter .2s,transform .2s",transform:isA?"scale(1.1)":"scale(1)"}}>{tab.icon}</span>
          <span style={{fontSize:8,fontWeight:isA?700:500,color:isA?D.il:D.mt,transition:"color .2s"}}>{tab.l}</span>
        </button>
      );})}
      <button onClick={onCfg} style={{flex:1,padding:"10px 4px 7px",border:"none",background:"transparent",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
        <span style={{fontSize:19,filter:"grayscale(1) opacity(0.5)"}}>⚙️</span>
        <span style={{fontSize:8,fontWeight:500,color:D.mt}}>{t.cfg}</span>
      </button>
    </div>
  );
}

// APP ROOT
export default function App(){
  const [dark,setDark]          = useState(true);
  const [lang,setLang]          = useState("es");
  const [tab,setTab]            = useState("calendar");
  const [games,setGames]        = useState([]);
  const [selected,setSelected]  = useState(null);
  const [showNotifs,setNotifs]  = useState(false);
  const [showAxe,setAxe]        = useState(false);
  const [showPricing,setPricing]= useState(false);
  const [showFeedback,setFb]    = useState(false);
  const [showSettings,setCfg]   = useState(false);
  const [userPlan,setUserPlan]  = useState("starter");
  const [notifN,setNotifN]      = useState(3);
  const [user,setUser]          = useState(null);
  const [ready,setReady]        = useState(false);
  const [liveStatus,setLS]      = useState("loading");

  const D=dark?DK:LT;
  const t=useT(lang);

  // Restore session + language + theme preference
  useEffect(()=>{
    try{
      const sl=localStorage.getItem("mlb_lang");
      if(sl&&LANGS[sl]) setLang(sl);
      const sd=localStorage.getItem("mlb_dark");
      if(sd!==null) setDark(sd!=="false");
      const hash=window.location.hash;
      if(hash.includes("access_token")){
        const p=new URLSearchParams(hash.replace("#","?"));
        const tok=p.get("access_token");
        if(tok){AUTH.sv({access_token:tok,user:{id:"google",email:"google@user"}});setUser(AUTH.user);window.history.replaceState(null,"",window.location.pathname);}
      } else {
        if(AUTH.restore()) setUser(AUTH.user);
      }
    }catch(e){}
    setReady(true);
  },[]);

  // Load games (live API + demo fallback, refresh every 90s)
  useEffect(()=>{
    if(!user) return;
    const load=async()=>{
      setLS("loading");
      const live=await fetchLive();
      if(live&&live.length>0){setGames(live);setLS("live");}
      else{setGames(buildDemo());setLS("demo");}
    };
    load();
    const id=setInterval(load,30000);
    return()=>clearInterval(id);
  },[user]);

  const liveN=games.filter(g=>g.isLive).length;
  const edgeN=games.filter(g=>{const p=predict(g.away,g.home,g.pf||1,g.wx?.wind||"");return p&&p.edge>0&&!g.isFinal;}).length;

  const handleAuth=u=>setUser(u);
  const handleLogout=()=>{AUTH.out();setUser(null);};
  const handleUpgrade=()=>{setPricing(true);setSelected(null);};
  const handlePlan=p=>{setUserPlan(p);setPricing(false);};

  // Splash
  if(!ready) return(
    <div style={{minHeight:"100vh",background:"#0a0e1a",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,fontFamily:"'Inter',system-ui,sans-serif"}}>
      <style>{`@keyframes vS{to{transform:rotate(360deg)}}`}</style>
      <div style={{fontSize:48}}>⚾</div>
      <div style={{fontSize:24,fontWeight:900,color:"#f9fafb"}}>MLB<span style={{color:"#6366f1"}}>Edge</span></div>
      <div style={{width:32,height:32,borderRadius:"50%",border:"3px solid rgba(99,102,241,0.3)",borderTop:"3px solid #6366f1",animation:"vS 0.7s linear infinite"}}/>
    </div>
  );

  // Auth
  if(!user) return(
    <>
      <style>{`@keyframes vS{to{transform:rotate(360deg)}}@keyframes vP{0%,100%{opacity:1}50%{opacity:.35}}@keyframes vU{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box;margin:0;padding:0;}button{font-family:inherit;cursor:pointer;transition:all .15s;}button:active{transform:scale(.96);}input,textarea{outline:none;font-family:inherit;}`}</style>
      <AuthScreen dark={dark} onAuth={handleAuth} lang={lang}/>
    </>
  );

  // Pricing full screen
  if(showPricing) return(
    <div style={{background:D.bg0,minHeight:"100vh",fontFamily:"'Inter',system-ui,sans-serif",color:D.tx}}>
      <style>{`@keyframes vS{to{transform:rotate(360deg)}}@keyframes vP{0%,100%{opacity:1}50%{opacity:.35}}@keyframes vU{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes vSU{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes vB{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}*{box-sizing:border-box;margin:0;padding:0;}button{font-family:inherit;cursor:pointer;transition:all .15s;}button:active{transform:scale(.96);}input,textarea{outline:none;font-family:inherit;}`}</style>
      <div style={{maxWidth:480,margin:"0 auto"}}>
        <PricingScreen D={D} t={t} userPlan={userPlan} onSelect={handlePlan} onBack={()=>setPricing(false)}/>
      </div>
    </div>
  );

  // Settings full screen
  if(showSettings) return(
    <div style={{background:D.bg0,minHeight:"100vh",fontFamily:"'Inter',system-ui,sans-serif",color:D.tx}}>
      <style>{`@keyframes vS{to{transform:rotate(360deg)}}@keyframes vP{0%,100%{opacity:1}50%{opacity:.35}}@keyframes vU{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box;margin:0;padding:0;}button{font-family:inherit;cursor:pointer;}input{outline:none;font-family:inherit;}`}</style>
      <div style={{maxWidth:480,margin:"0 auto"}}>
        <SettingsScreen dark={dark} setDark={setDark} lang={lang} setLang={setLang} D={D} t={t} onBack={()=>setCfg(false)}/>
      </div>
    </div>
  );

  // MAIN APP
  return(
    <div style={{minHeight:"100vh",background:D.bg0,fontFamily:"'Inter',system-ui,-apple-system,sans-serif",color:D.tx,transition:"background 0.3s ease"}}>
      <style>{`
        @keyframes vS  {to{transform:rotate(360deg)}}
        @keyframes vP  {0%,100%{opacity:1}50%{opacity:.35}}
        @keyframes vU  {from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes vSU {from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes vB  {0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
        ::-webkit-scrollbar{width:2px;height:2px}::-webkit-scrollbar-thumb{background:rgba(99,102,241,0.2);border-radius:99px}
        button{font-family:inherit;cursor:pointer;transition:all .15s ease;}button:active{transform:scale(.96);}
        input,textarea{outline:none;font-family:inherit;}html,body{overscroll-behavior:none;}
      `}</style>

      {dark&&<div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}>
        {[{c:"rgba(99,102,241,0.06)",x:"50%",y:"-10%",s:500},{c:"rgba(16,185,129,0.04)",x:"5%",y:"35%",s:300}].map((g,i)=>(
          <div key={i} style={{position:"absolute",width:g.s,height:g.s,borderRadius:"50%",background:`radial-gradient(circle,${g.c},transparent 70%)`,left:`calc(${g.x} - ${g.s/2}px)`,top:`calc(${g.y} - ${g.s/2}px)`,filter:"blur(40px)"}}/>
        ))}
      </div>}

      <div style={{position:"relative",zIndex:1,maxWidth:480,margin:"0 auto",paddingBottom:selected?0:72}}>

        {/* GAME DETAIL (full screen) */}
        {selected&&<GameDetail game={selected} onBack={()=>setSelected(null)} D={D} t={t} userPlan={userPlan}/>}

        {!selected&&<>
          {/* STICKY HEADER */}
          <div style={{position:"sticky",top:0,zIndex:30,background:dark?"rgba(10,14,26,0.96)":"rgba(240,244,248,0.96)",backdropFilter:"blur(28px)",WebkitBackdropFilter:"blur(28px)",borderBottom:`1px solid ${D.gb}`,padding:"13px 14px 11px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                  <span style={{fontSize:22}}>⚾</span>
                  <span style={{fontSize:21,fontWeight:900,letterSpacing:"-0.05em",color:D.tx}}>MLB<span style={{color:D.ind}}>Edge</span></span>
                  <span onClick={handleUpgrade} style={{background:`linear-gradient(135deg,${PLANS[userPlan].clr}44,${PLANS[userPlan].clr}28)`,border:`1px solid ${PLANS[userPlan].clr}44`,borderRadius:5,padding:"2px 7px",fontSize:8,fontWeight:800,color:PLANS[userPlan].clr,letterSpacing:"0.1em",cursor:"pointer"}}>{PLANS[userPlan].n.toUpperCase()}</span>
                  {liveStatus==="live"&&<span style={{fontSize:7,color:D.gr,background:`${D.gr}14`,border:`1px solid ${D.gr}28`,borderRadius:4,padding:"1px 5px",fontWeight:700}}>⚡ LIVE</span>}
                  
                  <span style={{fontSize:14}}>{LANGS[lang]?.f}</span>
                </div>
                <div style={{fontSize:9,color:D.mt}}>
                  {new Date().toLocaleDateString(lang==="en"?"en-US":lang==="pt"?"pt-BR":lang==="ja"?"ja-JP":lang==="ko"?"ko-KR":lang==="zh"?"zh-CN":"es",{weekday:"long",month:"long",day:"numeric"})}
                </div>
              </div>
              <div style={{display:"flex",gap:5,alignItems:"center"}}>
                {liveN>0&&<div style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:D.gr,fontWeight:600}}><Dot c={D.gr}/>{liveN}</div>}
                <button onClick={()=>{setNotifs(true);setNotifN(0);}} style={{position:"relative",width:34,height:34,borderRadius:9,border:`1px solid ${D.gb}`,background:D.gl,fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                  🔔{notifN>0&&<div style={{position:"absolute",top:-2,right:-2,background:D.rd,color:"white",fontSize:7,fontWeight:800,minWidth:14,height:14,borderRadius:99,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 2px",border:`1.5px solid ${D.bg0}`}}>{notifN}</div>}
                </button>
                <div style={{display:"flex",gap:4}}>
                  <div style={{background:D.gl,border:`1px solid ${D.gb}`,borderRadius:7,padding:"4px 7px",textAlign:"center"}}><div style={{fontSize:11,fontWeight:800,color:D.il}}>{edgeN}</div><div style={{fontSize:6,color:D.mt,textTransform:"uppercase"}}>Edge</div></div>
                  <div style={{background:D.gl,border:`1px solid ${D.gb}`,borderRadius:7,padding:"4px 7px",textAlign:"center"}}><div style={{fontSize:11,fontWeight:800,color:D.tx}}>{games.length}</div><div style={{fontSize:6,color:D.mt,textTransform:"uppercase"}}>{lang==="en"?"Games":"Juegos"}</div></div>
                </div>
              </div>
            </div>
          </div>

          {/* CALENDAR TAB */}
          {tab==="calendar"&&<CalendarScreen games={games} onSelect={setSelected} D={D} t={t}/>}
          {tab==="opps"&&<OppsScreen games={games} onSelect={setSelected} D={D} t={t} userPlan={userPlan}/>}
          {tab==="stats"&&<StatsScreen D={D} t={t}/>}
          {tab==="profile"&&<ProfileScreen D={D} t={t} user={user} userPlan={userPlan} onChangePlan={handleUpgrade} onLogout={handleLogout} onFeedback={()=>setFb(true)}/>}

          {/* BOTTOM NAV */}
          <Nav active={tab} onChange={setTab} badge={edgeN} D={D} t={t} onCfg={()=>setCfg(true)}/>

          {/* AXE FLOATING BUTTON */}
          <button onClick={()=>setAxe(true)} style={{position:"fixed",bottom:80,right:16,width:52,height:52,borderRadius:"50%",border:"none",zIndex:40,background:`linear-gradient(135deg,${D.ind},${D.vi})`,color:"white",fontSize:22,cursor:"pointer",boxShadow:`0 4px 20px ${D.ind}66`,display:"flex",alignItems:"center",justifyContent:"center",animation:"vU 0.5s 0.3s both ease"}}>🤖</button>
        </>}
      </div>

      {/* MODALS */}
      {showNotifs   &&<NotifCenter D={D} t={t} onClose={()=>setNotifs(false)}/>}
      {showAxe      &&<AxeChat dark={dark} D={D} t={t} onClose={()=>setAxe(false)} userPlan={userPlan} lang={lang}/>}
      {showFeedback &&<FeedbackModal D={D} t={t} onClose={()=>setFb(false)}/>}
    </div>
  );
}
