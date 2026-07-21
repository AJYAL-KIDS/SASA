(()=>{
    const $=s=>document.querySelector(s);
    const $$=s=>document.querySelectorAll(s);

    // SPLASH
    const splash=$('#splash');
    const letters=$$('.splash-letter');
    letters.forEach((l,i)=>setTimeout(()=>l.classList.add('bounce'),500+i*250));
    setTimeout(()=>{
        $('.splash-sub-text').classList.add('show');
        $('.splash-tagline').classList.add('show');
    },500+letters.length*250+300);
    setTimeout(()=>{
        splash.classList.add('hide');
        document.body.style.overflow='auto';
        setTimeout(()=>splash.remove(),900);
    },3800);
    document.body.style.overflow='hidden';

    // TOAST
    function toast(msg){
        const t=$('#toast');
        t.textContent=msg;
        t.classList.add('show');
        setTimeout(()=>t.classList.remove('show'),2200);
    }

    // MOBILE NAV
    const mobileNav=$('#mobileNav');
    const overlay=$('#overlay');
    $('#menuToggle').onclick=()=>{mobileNav.classList.add('open');overlay.classList.add('show')};
    $('#closeMobile').onclick=()=>{mobileNav.classList.remove('open');overlay.classList.remove('show')};
    overlay.onclick=()=>{mobileNav.classList.remove('open');overlay.classList.remove('show')};

    // SEARCH
    const searchPanel=$('#searchPanel');
    const searchInput=$('#searchInput');
    $('#searchToggle').onclick=()=>{searchPanel.classList.add('open');setTimeout(()=>searchInput.focus(),300)};
    $('#closeSearch').onclick=()=>searchPanel.classList.remove('open');
    document.addEventListener('keydown',e=>{
        if(e.key==='Escape'){searchPanel.classList.remove('open');mobileNav.classList.remove('open');overlay.classList.remove('show');closeCartFn();$('#modalOverlay').classList.remove('show');authOverlay.classList.remove('show');adminOverlay.classList.remove('show');$('#productModal').classList.remove('show')}
    });

    // FILTER
    const pills=$$('.pill');
    const products=$$('.product');
    function filterProducts(f){
        pills.forEach(p=>p.classList.remove('active'));
        const match=[...pills].find(p=>p.dataset.filter===f);
        if(match)match.classList.add('active');
        products.forEach(p=>{
            const tags=p.dataset.tags||'';
            if(f==='all'||tags.includes(f)){
                p.classList.remove('hidden');
                p.style.animation='fadeUp .4s ease forwards';
            }else{
                p.classList.add('hidden');
            }
        });
    }
    pills.forEach(pill=>{
        pill.addEventListener('click',()=>filterProducts(pill.dataset.filter));
    });

    // AGE CARDS -> FILTER PRODUCTS
    $$('.age-card').forEach(card=>{
        card.addEventListener('click',e=>{
            e.preventDefault();
            const age=card.dataset.age;
            filterProducts(age);
            const target=$('#productsGrid');
            if(target){
                target.scrollIntoView({behavior:'smooth',block:'start'});
            }
        });
    });

    // WISHLIST
    $$('.fav-btn').forEach(btn=>{
        btn.addEventListener('click',e=>{
            e.preventDefault();e.stopPropagation();
            btn.classList.toggle('active');
            toast(btn.classList.contains('active')?'تمت الإضافة للمفضلة ♥':'تمت الإزالة من المفضلة');
        });
    });

    // CART
    const cartPanel=$('#cartPanel');
    const cartOverlay=$('#cartOverlay');
    const cartItems=$('#cartItems');
    const cartEmpty=$('#cartEmpty');
    const cartFooter=$('#cartFooter');
    const cartCountLabel=$('#cartCountLabel');

    function openCart(){cartPanel.classList.add('open');cartOverlay.classList.add('show')}
    function closeCartFn(){cartPanel.classList.remove('open');cartOverlay.classList.remove('show')}

    const cartTriggers=$$('.cart-trigger');
    cartTriggers.forEach(t=>t.addEventListener('click',e=>{e.preventDefault();openCart()}));
    $('#closeCart').addEventListener('click',closeCartFn);
    cartOverlay.addEventListener('click',closeCartFn);
    $('#continueShopping').addEventListener('click',e=>{e.preventDefault();closeCartFn()});

    function arToEn(s){
        return s.replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));
    }
    function recalcCart(){
        const items=cartItems.querySelectorAll('.cart-item');
        let total=0,qty=0;
        items.forEach(item=>{
            const q=parseInt(item.querySelector('.qty-num').textContent);
            const priceText=arToEn(item.querySelector('.cart-item-price').textContent);
            const price=parseInt(priceText.replace(/[^\d]/g,''));
            total+=(isNaN(price)?0:price)*q;
            qty+=q;
        });
        const fmt=n=>n.toLocaleString('ar-EG')+' ج.م';
        $('#subtotal').textContent=fmt(total);
        $('#totalPrice').textContent=fmt(total);
        const arNums=['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
        const toAr=n=>String(n).split('').map(d=>arNums[d]).join('');
        cartCountLabel.textContent='('+toAr(items.length)+' منتجات)';
        const badge=$('#cartBadge');
        if(qty>0){badge.textContent=qty;badge.classList.add('show');cartEmpty.classList.remove('show');cartFooter.style.display=''}
        else{badge.classList.remove('show');cartEmpty.classList.add('show');cartFooter.style.display='none'}
    }

    cartItems.addEventListener('click',e=>{
        const btn=e.target.closest('.qty-btn');
        if(btn){
            const num=btn.parentElement.querySelector('.qty-num');
            let val=parseInt(num.textContent);
            if(btn.classList.contains('plus'))val++;
            else if(val>1)val--;
            num.textContent=val;
            recalcCart();
        }
        const rm=e.target.closest('.remove-item');
        if(rm){
            const item=rm.closest('.cart-item');
            item.style.opacity='0';item.style.transform='translateX(40px)';item.style.transition='all .3s';
            setTimeout(()=>{item.remove();recalcCart();if(!cartItems.querySelector('.cart-item')){cartEmpty.classList.add('show');cartFooter.style.display='none'}},300);
            toast('تمت الإزالة من السلة');
        }
    });

    function openModal(card,buyNow){
        const name=card.querySelector('h4').textContent;
        const priceText=card.querySelector('.price').textContent;
        const cat=card.querySelector('.product-cat').textContent;

        $('#modalName').textContent=name;
        $('#modalCat').textContent=cat;
        $('#modalPrice').textContent=priceText;

        const sizeInput=$('#modalSizeInput');
        const colorInput=$('#modalColorInput');
        sizeInput.value='';
        colorInput.value='';

        const addBtn=$('#modalAddBtn');
        addBtn.textContent=buyNow?'اشتري الآن':'أضف للسلة';
        function updateAddBtn(){addBtn.disabled=!(sizeInput.value.trim()&&colorInput.value.trim())}
        addBtn.disabled=true;
        sizeInput.addEventListener('input',updateAddBtn);
        colorInput.addEventListener('input',updateAddBtn);

        addBtn.onclick=()=>{
            const sz=sizeInput.value.trim();
            const cl=colorInput.value.trim();
            if(!sz||!cl)return;

            if(buyNow){
                let msg='*طلب جديد من SASA - اجيال كيدز* 🛒\n━━━━━━━━━━━━━━━━━━━━\n\n';
                msg+='*'+name+'*\n';
                msg+='   الفئة: '+cat+'\n';
                msg+='   المقاس: '+sz+'\n';
                msg+='   اللون: '+cl+'\n';
                msg+='   الكمية: 1\n';
                msg+='   السعر: '+priceText+'\n\n';
                msg+='━━━━━━━━━━━━━━━━━━━━\n';
                const price=parseInt(priceText.replace(/[^\d]/g,''));
                msg+='*الإجمالي: '+price.toLocaleString('ar-EG')+' ج.م*\n';
                msg+='━━━━━━━━━━━━━━━━━━━━\n';
                msg+='\nشكراً لك! 🙏';
                window.open('https://wa.me/201500351338?text='+encodeURIComponent(msg),'_blank');
                $('#modalOverlay').classList.remove('show');
                return;
            }

            const existing=[...cartItems.querySelectorAll('.cart-item')].find(i=>
                i.querySelector('h4').textContent===name&&
                i.querySelector('.cart-item-size strong').textContent===sz&&
                i.querySelector('.cart-item-color strong').textContent===cl
            );
            if(existing){
                const num=existing.querySelector('.qty-num');
                num.textContent=parseInt(num.textContent)+1;
                existing.style.background='#f0fdf4';
                setTimeout(()=>existing.style.background='',500);
            }else{
                cartEmpty.classList.remove('show');
                cartFooter.style.display='';
                const bgColors=['#fef3e2','#e3f2fd','#fce4ec','#e8f5e9'];
                const shapes=['baby-shape','toddler-shape','kids-shape','junior-shape'];
                const c=bgColors[Math.floor(Math.random()*bgColors.length)];
                const sh=shapes[Math.floor(Math.random()*shapes.length)];
                const div=document.createElement('div');
                div.className='cart-item';
                div.innerHTML=`
                    <div class="cart-item-img" style="background:${c}"><div class="product-shape ${sh}"></div></div>
                    <div class="cart-item-info">
                        <h4>${name}</h4>
                        <span class="cart-item-cat">${cat}</span>
                        <div class="cart-item-size">المقاس: <strong>${sz}</strong></div>
                        <div class="cart-item-color">اللون: <strong>${cl}</strong></div>
                        <div class="cart-item-bottom">
                            <div class="qty-control">
                                <button class="qty-btn minus">−</button>
                                <span class="qty-num">1</span>
                                <button class="qty-btn plus">+</button>
                            </div>
                            <span class="cart-item-price">${priceText}</span>
                        </div>
                    </div>
                    <button class="remove-item" aria-label="حذف"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>`;
                cartItems.prepend(div);
            }
            recalcCart();
            $('#modalOverlay').classList.remove('show');
            toast('تمت الإضافة للسلة 🛒');
        };

        $('#modalOverlay').classList.add('show');
    }

    $$('.btn-add-cart').forEach(btn=>{
        btn.addEventListener('click',e=>{
            e.preventDefault();
            openModal(btn.closest('.product'),false);
        });
    });

    $$('.btn-buy-now').forEach(btn=>{
        btn.addEventListener('click',e=>{
            e.preventDefault();
            openModal(btn.closest('.product'),true);
        });
    });

    $('#modalClose').addEventListener('click',()=>$('#modalOverlay').classList.remove('show'));
    $('#modalOverlay').addEventListener('click',e=>{if(e.target===$('#modalOverlay'))$('#modalOverlay').classList.remove('show')});

    recalcCart();

    // CHECKOUT VIA WHATSAPP
    $('#checkoutBtn').addEventListener('click',()=>{
        const items=cartItems.querySelectorAll('.cart-item');
        if(!items.length){return}
        let msg='*طلب جديد من SASA - اجيال كيدز* 🛒\n━━━━━━━━━━━━━━━━━━━━\n\n';
        let total=0;
        items.forEach((item,i)=>{
            const name=item.querySelector('h4').textContent;
            const cat=item.querySelector('.cart-item-cat').textContent;
            const size=item.querySelector('.cart-item-size strong').textContent;
            const colorEl=item.querySelector('.cart-item-color strong');
            const color=colorEl?colorEl.textContent:'غير محدد';
            const qty=item.querySelector('.qty-num').textContent;
            const priceText=item.querySelector('.cart-item-price').textContent;
            const price=parseInt(arToEn(priceText).replace(/[^\d]/g,''));
            total+=(isNaN(price)?0:price)*parseInt(qty);
            msg+='*'+(i+1)+'. '+name+'*\n';
            msg+='   الفئة: '+cat+'\n';
            msg+='   المقاس: '+size+'\n';
            msg+='   اللون: '+color+'\n';
            msg+='   الكمية: '+qty+'\n';
            msg+='   السعر: '+priceText+'\n\n';
        });
        msg+='━━━━━━━━━━━━━━━━━━━━\n';
        msg+='*الإجمالي: '+total.toLocaleString('ar-EG')+' ج.م*\n';
        msg+='━━━━━━━━━━━━━━━━━━━━\n';
        msg+='\nشكراً لك! 🙏';
        const encoded=encodeURIComponent(msg);
        window.open('https://wa.me/201500351338?text='+encoded,'_blank');
    });

    // CONTACT US - WhatsApp with products & offers
    function openContactWA(){
        let msg='*مرحبًا! أنا مهتم بمنتجات SASA - اجيال كيدز* 👋\n━━━━━━━━━━━━━━━━━━━━\n\n';
        msg+='*🛒 المنتجات المتاحة:*\n\n';
        let i=1;
        $$('.product').forEach(p=>{
            const name=p.querySelector('h4').textContent;
            const cat=p.querySelector('.product-cat').textContent;
            const price=p.querySelector('.price').textContent;
            const oldEl=p.querySelector('.old');
            const old=oldEl?' (كان '+oldEl.textContent+')':'';
            msg+=i+'. '+name+'\n';
            msg+='   الفئة: '+cat+'\n';
            msg+='   السعر: '+price+old+'\n\n';
            i++;
        });
        msg+='━━━━━━━━━━━━━━━━━━━━\n';
        msg+='عايز أعرف أكتر عن المنتجات أو أعمل طلب 🙏';
        window.open('https://wa.me/201500351338?text='+encodeURIComponent(msg),'_blank');
    }
    $('#contactUs').addEventListener('click',e=>{e.preventDefault();openContactWA()});
    $('#contactUsMobile').addEventListener('click',e=>{e.preventDefault();openContactWA()});

    // NEWSLETTER
    $('#nlForm').addEventListener('submit',e=>{
        e.preventDefault();
        const inp=e.target.querySelector('input');
        if(inp.value.trim()){toast('تم الاشتراك بنجاح ✓');inp.value=''}
    });

    // SCROLL REVEAL
    const obs=new IntersectionObserver(entries=>{
        entries.forEach(entry=>{
            if(entry.isIntersecting){
                entry.target.style.opacity='1';
                entry.target.style.transform='translateY(0)';
                obs.unobserve(entry.target);
            }
        });
    },{threshold:.08,rootMargin:'0px 0px -40px 0px'});

    $$('.age-card,.product,.feat,.banner-box,.nl-box').forEach((el,i)=>{
        el.style.opacity='0';
        el.style.transform='translateY(24px)';
        el.style.transition=`opacity .6s ease ${i*0.05}s,transform .6s ease ${i*0.05}s`;
        obs.observe(el);
    });

    // ADMIN PRODUCTS
    let editingIdx=null;
    let currentAdminFilter='all';
    const catMap={baby:'مواليد · ',toddler:'صغار · ',kids:'أطفال · ',junior:'كبار · '};
    const tagMap={baby:'baby',toddler:'toddler',kids:'kids',junior:'junior'};

    function renderAdminProducts(filter){
        currentAdminFilter=filter;
        const list=$('#adminProductsList');
        list.innerHTML='';
        const all=$$('.product');
        let count=0;
        all.forEach((p,i)=>{
            const tags=p.dataset.tags||'';
            if(filter!=='all'&&!tags.includes(filter))return;
            count++;
            const name=p.querySelector('h4').textContent;
            const cat=p.querySelector('.product-cat').textContent;
            const price=p.querySelector('.price').textContent;
            const div=document.createElement('div');
            div.className='admin-product-item';
            div.innerHTML='<div class="admin-product-info"><h4>'+name+'</h4><span>'+cat+' · '+price+'</span></div><div class="admin-product-actions"><button class="admin-edit-btn" data-idx="'+i+'">تعديل</button><button class="admin-del-btn" data-idx="'+i+'">حذف</button></div>';
            list.appendChild(div);
        });
        if(count===0)list.innerHTML='<div class="admin-empty">لا توجد منتجات في هذا القسم</div>';

        list.querySelectorAll('.admin-del-btn').forEach(btn=>{
            btn.addEventListener('click',()=>{
                const idx=parseInt(btn.dataset.idx);
                const target=all[idx];
                if(target){
                    target.style.opacity='0';target.style.transform='scale(.9)';target.style.transition='all .3s';
                    setTimeout(()=>{target.remove();renderAdminProducts(currentAdminFilter);$('#statProducts').textContent=$$('.product').length;toast('تم حذف المنتج')},300);
                }
            });
        });

        list.querySelectorAll('.admin-edit-btn').forEach(btn=>{
            btn.addEventListener('click',()=>{
                const idx=parseInt(btn.dataset.idx);
                const p=all[idx];
                editingIdx=idx;
                $('#productModalTitle').textContent='تعديل المنتج';
                $('#pfSubmit').textContent='حفظ التعديلات';
                $('#pfName').value=p.querySelector('h4').textContent;
                const catText=p.querySelector('.product-cat').textContent;
                const priceText=p.querySelector('.price').textContent;
                $('#pfPrice').value=priceText;
                const oldEl=p.querySelector('.old');
                $('#pfOldPrice').value=oldEl?oldEl.textContent:'';
                const imgEl=p.querySelector('.product-img');
                $('#pfImage').value=imgEl.dataset.img||'';
                const tags=p.dataset.tags||'';
                ['baby','toddler','kids','junior'].forEach(c=>{if(tags.includes(c))$('#pfCategory').value=c});
                ['boys','girls'].forEach(g=>{if(tags.includes(g))$('#pfGender').value=g});
                $('#productModal').classList.add('show');
            });
        });
    }

    function addProductToPage(data){
        const grid=$('#productsGrid');
        const tag=data.cat+' '+data.gender+' new';
        const colors={baby:'#fef3e2',toddler:'#e3f2fd',kids:'#fce4ec',junior:'#e8eaf6'};
        const shapes={baby:'baby-shape',toddler:'toddler-shape',kids:'kids-shape',junior:'junior-shape'};
        const catLabels={baby:'مواليد',toddler:'صغار',kids:'أطفال',junior:'كبار'};
        const genderLabels={boys:'ولاد',girls:'بنات'};
        const article=document.createElement('article');
        article.className='product';
        article.dataset.tags=tag;
        const bg=colors[data.cat]||'#f2f2f2';
        const shape=shapes[data.cat]||'kids-shape';
        let imgHTML='';
        if(data.image){imgHTML='<img src="'+data.image+'" alt="'+data.name+'" style="width:100%;height:100%;object-fit:cover;border-radius:14px;">'}
        else{imgHTML='<div class="product-shape '+shape+'"></div>'}
        let oldHTML=data.oldPrice?'<span class="old">'+data.oldPrice+'</span>':'';
        article.innerHTML='<div class="product-img" style="background:'+bg+';" data-img="'+data.image+'">'+imgHTML+'<button class="fav-btn" aria-label="مفضلة"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg></button></div><div class="product-body"><span class="product-cat">'+catLabels[data.cat]+' · '+genderLabels[data.gender]+'</span><h4>'+data.name+'</h4><div class="price-row"><span class="price">'+data.price+'</span>'+oldHTML+'</div><div class="product-actions"><button class="btn-add-cart">أضف للسلة</button><button class="btn-buy-now">اشتري الآن</button></div></div>';
        grid.appendChild(article);

        article.querySelector('.btn-add-cart').addEventListener('click',e=>{e.preventDefault();openModal(article,false)});
        article.querySelector('.btn-buy-now').addEventListener('click',e=>{e.preventDefault();openModal(article,true)});
        article.querySelector('.fav-btn').addEventListener('click',e=>{e.preventDefault();e.stopPropagation();article.querySelector('.fav-btn').classList.toggle('active');toast(article.querySelector('.fav-btn').classList.contains('active')?'تمت الإضافة للمفضلة ♥':'تمت الإزالة من المفضلة')});
    }

    $('#addProductBtn').addEventListener('click',()=>{
        editingIdx=null;
        $('#productModalTitle').textContent='إضافة منتج جديد';
        $('#pfSubmit').textContent='إضافة المنتج';
        $('#productForm').reset();
        $('#productModal').classList.add('show');
    });
    $('#productModalClose').addEventListener('click',()=>$('#productModal').classList.remove('show'));
    $('#productModal').addEventListener('click',e=>{if(e.target===$('#productModal'))$('#productModal').classList.remove('show')});

    $('#productForm').addEventListener('submit',e=>{
        e.preventDefault();
        const data={
            image:$('#pfImage').value.trim(),
            name:$('#pfName').value.trim(),
            cat:$('#pfCategory').value,
            gender:$('#pfGender').value,
            price:$('#pfPrice').value.trim(),
            oldPrice:$('#pfOldPrice').value.trim()
        };
        if(editingIdx!==null){
            const p=$$('.product')[editingIdx];
            if(p){
                p.querySelector('h4').textContent=data.name;
                p.querySelector('.price').textContent=data.price;
                p.querySelector('.product-cat').textContent=(catMap[data.cat]||'')+({'boys':'ولاد','girls':'بنات'}[data.gender]);
                const imgEl=p.querySelector('.product-img');
                if(data.image){
                    imgEl.innerHTML='<img src="'+data.image+'" alt="'+data.name+'" style="width:100%;height:100%;object-fit:cover;border-radius:14px;">';
                    imgEl.dataset.img=data.image;
                }
                const oldEl=p.querySelector('.old');
                if(data.oldPrice){
                    if(oldEl){oldEl.textContent=data.oldPrice}else{const sp=document.createElement('span');sp.className='old';sp.textContent=data.oldPrice;p.querySelector('.price-row').appendChild(sp)}
                }else if(oldEl){oldEl.remove()}
                p.dataset.tags=data.cat+' '+data.gender;
                toast('تم تعديل المنتج ✓');
            }
        }else{
            addProductToPage(data);
            toast('تمت إضافة المنتج ✓');
        }
        $('#productModal').classList.remove('show');
        renderAdminProducts(currentAdminFilter);
        $('#statProducts').textContent=$$('.product').length;
    });

    // AUTH MODAL
    const authOverlay=$('#authOverlay');
    const adminOverlay=$('#adminOverlay');
    let isAdmin=false;

    $('#loginToggle').addEventListener('click',()=>authOverlay.classList.add('show'));
    $('#authClose').addEventListener('click',()=>authOverlay.classList.remove('show'));
    authOverlay.addEventListener('click',e=>{if(e.target===authOverlay)authOverlay.classList.remove('show')});

    $$('.auth-tab').forEach(tab=>{
        tab.addEventListener('click',()=>{
            $$('.auth-tab').forEach(t=>t.classList.remove('active'));
            tab.classList.add('active');
            const t=tab.dataset.tab;
            $('#loginForm').classList.toggle('hidden',t!=='login');
            $('#registerForm').classList.toggle('hidden',t!=='register');
        });
    });

    function renderAdminProducts(filter){
        const list=$('#adminProductsList');
        list.innerHTML='';
        const all=$$('.product');
        let count=0;
        all.forEach((p,i)=>{
            const tags=p.dataset.tags||'';
            if(filter!=='all'&&!tags.includes(filter))return;
            count++;
            const name=p.querySelector('h4').textContent;
            const cat=p.querySelector('.product-cat').textContent;
            const price=p.querySelector('.price').textContent;
            const div=document.createElement('div');
            div.className='admin-product-item';
            div.innerHTML='<div class="admin-product-info"><h4>'+name+'</h4><span>'+cat+' · '+price+'</span></div><div class="admin-product-actions"><button class="admin-del-btn" data-idx="'+i+'">حذف</button></div>';
            list.appendChild(div);
        });
        if(count===0)list.innerHTML='<div class="admin-empty">لا توجد منتجات في هذا القسم</div>';
        list.querySelectorAll('.admin-del-btn').forEach(btn=>{
            btn.addEventListener('click',()=>{
                const idx=parseInt(btn.dataset.idx);
                const target=all[idx];
                if(target){
                    target.style.opacity='0';target.style.transform='scale(.9)';target.style.transition='all .3s';
                    setTimeout(()=>{target.remove();renderAdminProducts(filter);$('#statProducts').textContent=$$('.product').length;toast('تم حذف المنتج')},300);
                }
            });
        });
    }

    function openAdmin(){
        let totalOrders=0;
        $$('.cart-item').forEach(()=>totalOrders++);
        let revenue=0;
        $$('.cart-item').forEach(item=>{
            const p=parseInt(arToEn(item.querySelector('.cart-item-price').textContent).replace(/[^\d]/g,''));
            const q=parseInt(item.querySelector('.qty-num').textContent);
            revenue+=(isNaN(p)?0:p)*q;
        });
        $('#statProducts').textContent=$$('.product').length;
        $('#statOrders').textContent=totalOrders;
        $('#statRevenue').textContent=revenue.toLocaleString('ar-EG')+' ج.م';

        renderAdminProducts('all');

        $$('.admin-cat-tab').forEach(tab=>{
            tab.onclick=()=>{
                $$('.admin-cat-tab').forEach(t=>t.classList.remove('active'));
                tab.classList.add('active');
                renderAdminProducts(tab.dataset.acat);
            };
        });

        const ordersList=$('#adminOrders');
        const cartItemsEls=$$('.cart-item');
        ordersList.innerHTML='';
        if(cartItemsEls.length===0){
            ordersList.innerHTML='<div class="admin-empty">لا توجد طلبات بعد</div>';
        }else{
            cartItemsEls.forEach(item=>{
                const name=item.querySelector('h4').textContent;
                const price=item.querySelector('.cart-item-price').textContent;
                const sz=item.querySelector('.cart-item-size strong').textContent;
                const cl=item.querySelector('.cart-item-color strong').textContent;
                const q=item.querySelector('.qty-num').textContent;
                const div=document.createElement('div');
                div.className='admin-order';
                div.innerHTML='<div><div class="admin-order-name">'+name+'</div><div class="admin-order-date">مقاس: '+sz+' | لون: '+cl+' | كمية: '+q+'</div></div><div class="admin-order-total">'+price+'</div>';
                ordersList.appendChild(div);
            });
        }

        adminOverlay.classList.add('show');
    }

    $('#adminClose').addEventListener('click',()=>adminOverlay.classList.remove('show'));
    adminOverlay.addEventListener('click',e=>{if(e.target===adminOverlay)adminOverlay.classList.remove('show')});
    $('#adminLogout').addEventListener('click',()=>{
        isAdmin=false;
        adminOverlay.classList.remove('show');
        toast('تم تسجيل الخروج');
        $('#loginToggle').style.opacity='1';
    });

    $('#loginForm').addEventListener('submit',e=>{
        e.preventDefault();
        const email=e.target.querySelector('input[type="email"]').value.trim();
        const pass=e.target.querySelector('input[type="password"]').value.trim();
        if(email==='sasa@gmail.com'&&pass==='sasa1234'){
            isAdmin=true;
            toast('مرحبًا المدير! 👑');
            authOverlay.classList.remove('show');
            openAdmin();
        }else{
            toast('البريد أو كلمة المرور غير صحيحة ✗');
        }
    });
    $('#registerForm').addEventListener('submit',e=>{
        e.preventDefault();
        toast('تم إنشاء الحساب بنجاح ✓');
        authOverlay.classList.remove('show');
    });

    // SMOOTH SCROLL
    $$('a[href^="#"]').forEach(a=>{
        a.addEventListener('click',e=>{
            const h=a.getAttribute('href');
            if(h==='#')return;
            const t=$(h);
            if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth',block:'start'});mobileNav.classList.remove('open');overlay.classList.remove('show')}
        });
    });
})();
