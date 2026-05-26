--
-- PostgreSQL database dump
--

\restrict WnptAZ2lhyg1sFLPTNJiycxjRMUrMcMad7TW9rmjytzdKehGm3tTOlp8QNGbbXH

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.9

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: banners; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.banners (id, image, eyebrow, title, subtitle, cta_label, cta_url, align, is_active, sort_order, created_at, updated_at) VALUES ('83e2994d-6642-477b-b6d2-7e0097f549ea', '/products/banner-watch.jpg', 'Relojería Rubí', 'Elegancia que trasciende', 'Piezas únicas seleccionadas a mano. El tiempo como testigo de los momentos que importan.', 'Explorar relojería', '/catalogo?cat=relojeria', 'left', true, 1, '2026-05-23 00:35:29.606242+00', '2026-05-23 00:35:29.606242+00');
INSERT INTO public.banners (id, image, eyebrow, title, subtitle, cta_label, cta_url, align, is_active, sort_order, created_at, updated_at) VALUES ('d5cfb5a7-897c-4db1-bcd8-c4ff4d33554b', '/products/banner-jewelry.jpg', 'Nueva colección', 'La luz hecha materia', 'Joyería fina diseñada para celebrar tu historia. Diamantes y oro de la más alta calidad.', 'Descubrir joyería', '/catalogo?cat=joyeria', 'right', true, 2, '2026-05-23 00:35:29.606242+00', '2026-05-23 00:35:29.606242+00');
INSERT INTO public.banners (id, image, eyebrow, title, subtitle, cta_label, cta_url, align, is_active, sort_order, created_at, updated_at) VALUES ('1b670cd4-3d8d-4a9d-b161-1ebd791ad9fa', '/products/banner-gift.jpg', 'El regalo perfecto', 'Cada pieza, una historia', 'Sorprende con un regalo inolvidable. Envío y empaque de regalo en todo el país.', 'Ver piezas con descuento', '/catalogo', 'center', true, 3, '2026-05-23 00:35:29.606242+00', '2026-05-23 00:35:29.606242+00');


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.categories (id, slug, name, image_url, sort_order, is_active, created_at, updated_at) VALUES ('9309a898-458d-4436-a8b0-048829806fa1', 'relojeria', 'Relojería', '', 1, true, '2026-05-23 01:07:26.665467+00', '2026-05-23 01:07:26.665467+00');
INSERT INTO public.categories (id, slug, name, image_url, sort_order, is_active, created_at, updated_at) VALUES ('123454cc-e2c6-40e4-ac01-34da0c082069', 'joyeria', 'Joyería', '', 2, true, '2026-05-23 01:07:26.665467+00', '2026-05-23 01:07:26.665467+00');


--
-- Data for Name: coupons; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.orders (id, user_id, customer_name, customer_email, customer_phone, city, address, notes, subtotal, shipping, total, status, payment_method, payment_reference, created_at, updated_at, wompi_reference, wompi_transaction_id, wompi_payload, coupon_code, discount) VALUES ('f9ec266f-a271-4b3c-b081-b935c6b52e3f', '98310613-8071-4f0d-8c38-eb9af63b89ad', 'Yeison Escobar Arias', 'yeisone7@gmail.com', '3163698255', 'Cantagallo', 'Cl. 3 # 9-13, Cantagallo Bolivar', '', 1090000, 0, 1090000, 'pending', 'wompi', 'RUBI-f9ec266f-a271-4b3c-b081-b935c6b52e3f', '2026-05-23 03:13:20.574559+00', '2026-05-23 03:13:20.834395+00', 'RUBI-f9ec266f-a271-4b3c-b081-b935c6b52e3f', '', '{}', '', 0);
INSERT INTO public.orders (id, user_id, customer_name, customer_email, customer_phone, city, address, notes, subtotal, shipping, total, status, payment_method, payment_reference, created_at, updated_at, wompi_reference, wompi_transaction_id, wompi_payload, coupon_code, discount) VALUES ('9dda4746-49ed-40eb-a072-ddd4ef7ba612', '98310613-8071-4f0d-8c38-eb9af63b89ad', 'Yeison Escobar Arias', 'yeisone7@gmail.com', '3163698255', 'Cantagallo', 'Cl. 3 # 9-13, Cantagallo Bolivar', '', 2190000, 0, 2190000, 'paid', 'wompi', 'RUBI-9dda4746-49ed-40eb-a072-ddd4ef7ba612', '2026-05-23 03:25:22.515988+00', '2026-05-23 03:27:25.242956+00', 'RUBI-9dda4746-49ed-40eb-a072-ddd4ef7ba612', '12100060-1779506841-37564', '{}', '', 0);
INSERT INTO public.orders (id, user_id, customer_name, customer_email, customer_phone, city, address, notes, subtotal, shipping, total, status, payment_method, payment_reference, created_at, updated_at, wompi_reference, wompi_transaction_id, wompi_payload, coupon_code, discount) VALUES ('73bdf68d-0c47-48ad-a785-07253b66fb70', NULL, 'ds', 'joanthanloa@hotmail.com', 'dsa', 'sad', 'da', 'da', 1090000, 0, 1090000, 'paid', 'wompi', 'RUBI-73bdf68d-0c47-48ad-a785-07253b66fb70', '2026-05-23 17:13:19.038066+00', '2026-05-23 17:15:57.43805+00', 'RUBI-73bdf68d-0c47-48ad-a785-07253b66fb70', '12100060-1779556555-17428', '{"data": {"transaction": {"id": "12100060-1779556555-17428", "origin": null, "status": "APPROVED", "currency": "COP", "reference": "RUBI-73bdf68d-0c47-48ad-a785-07253b66fb70", "created_at": "2026-05-23T17:15:55.228Z", "billing_data": null, "finalized_at": "2026-05-23T17:15:55.907Z", "redirect_url": "https://ruby-shop.lovable.app/checkout/confirmacion?ref=RUBI-73bdf68d-0c47-48ad-a785-07253b66fb70", "customer_data": {"device_id": "3f910f131afb63bea5a7d11149d6f40b", "full_name": "mario ramon", "browser_info": {"browser_tz": "300", "browser_language": "es-419", "browser_user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.4 Safari/605.1.15", "browser_color_depth": "24", "browser_screen_width": "1440", "browser_screen_height": "900"}, "phone_number": "+573175390953", "device_data_token": "eyJhbGciOiJIUzI1NiJ9.eyJjb21wcmVzc2VkIjoiZUp6VlZVMXYyemdRL1NzRVR5MmcycFF0SzdiMzVNUnRFalJ1alhVK0ZsZ1VBVVdPSk1JVXFhVW9PMm1RLzc1REtYSGRvbnZQWGdUcXpaQjg4OTZRZktLbDkvVk5BMjVSZ1BGMFRsZjJ1OUthRHljRFJ0NnR1RkRHMjZiOGcxd2FENW9nUUw1dXlGOGtadmZ4NVA3a1BWblV0WVk3eUQ0clAwelpaQkFQNGdsNTkvbmllblVWRWEyMlFNNUJiTzE3Y2d1dVVkWU1SeW5aOEp3N2RVaW4wYzhzbHR4ek9uK2ltYk43eEpCVVB3SHpYcUQ3WGI4WWhrYnBJTUdBYlhCY2NmRjEwLzBjSmNRTXR4aWNJQ3hocHdTRUdsL0xRcEE3VVNvUHdyY3VoRzdNMXRpOXdRQ1lRcGtBOWNVaG9ya3BXbDRFREpvUFNUeERURFVybXltTldNNTFBd0c0NXBrR2Z3UXNvZGw2VzlPNWR5MDhSN1RXM09mV1ZUMlRUdGdYQ1JaQ1FPMnZmck9QNFR0VmNHL2QydGthbkZmUW5OazJPRFlaUlhRUDJmblZMUmhwM1RIaER2NFRZWER3STBEdUF2d2FEbUlmWm5abW90VmljQncrV3FGUE9GL2ZITWMzSmNmNDJvRlF2ZWFqY1VSekIvKzBZTVRqd25EOTJObVlUQmxqRWZXcWd1KzJrM1pSZ1ZPQ0QwOXRZZEh6aURiQ0FaZzdKWDFKNTNHU3NGZm9BbFJSWXJVemRvQ1dLQlZtalpLSUNtdTNxTWhIRTZTWHZkRG9seFZjYjFBejFQS1hVQU5Ob1ByN29NSnlIMEF1VDMvQlMrN2tuanM0czBhMHpvWGk2SHo2MmxjcnFLeERBUG1oUVpYcU5tak9PSmFJM1V4clo2czZtSElVWENtQmJwYTlGb2VFM0JxUDNmdzNYVGpGTmJreFNsZ0paQlU2K3h6UEpoNGYwK0Q0QXZRT1BNcEh2a0FMQ0t6QWFFdS9SYlJ0WUNGUHNmenRvUXVsL1dMOXRlTUJvdTJoeVd2ZFlwZUgzWjZ3eGFyQVk3MzhSRzRWN05HeFVCcHFyV3JmSDZXMWRUNG9RcFpXdEJXZVZQSUoyNWdIMGhXYWV2MVlRNytVeHhIbWMrd1c1QmRtRDJ1WkIzL2JQRmNQSVlzRzREazY1SHA0OFArUjlDMmt2YkE3SzFFbUlQOERrcXF0M2pqTnJ2MGFtM3Z5VVJadlhkT1h1eXRybGZZZmxBbHMzdzVOUEhNN0pjSDIyelhoOGFycXBIdVJIalBvNzhycTZOY1dCZjdoOHRUMWQ2dThyUEFldXVENEpNM3BsRTl6SmtkWk5zM1NNUnZMbEtXTVR5R2ZzVmlPaFJRVHhrYlpPSkY1a2tLU1R2QWJQaUtOUjJNbVJjSVBUOTNsRWxjYjU3T1k1ZkU0NWprdWx3R2Y4Qk1aeDNFeWsybWVzSXcrL3d2eG1xOGsifQ.VIP72zSFaHIf7DUhPmjYrG8gWHakX0TlwG4zWHWJFU4"}, "customer_email": "joanthanloa@hotmail.com", "payment_method": {"type": "NEQUI", "extra": {"is_three_ds": false, "transaction_id": "SANDBOX-1779556555y4LzPF", "three_ds_auth_type": null, "external_identifier": "1779556555iFTqzZ"}, "phone_number": "3991111111"}, "status_message": null, "amount_in_cents": 109000000, "payment_link_id": null, "shipping_address": null, "payment_source_id": null, "payment_method_type": "NEQUI"}}, "event": "transaction.updated", "sent_at": "2026-05-23T17:15:56.147Z", "signature": {"checksum": "221b9ad44e2334501d8d08cdc0114718eae21ef753576724370dc697a05e7dd6", "properties": ["transaction.id", "transaction.status", "transaction.amount_in_cents"]}, "timestamp": 1779556556, "environment": "test"}', '', 0);
INSERT INTO public.orders (id, user_id, customer_name, customer_email, customer_phone, city, address, notes, subtotal, shipping, total, status, payment_method, payment_reference, created_at, updated_at, wompi_reference, wompi_transaction_id, wompi_payload, coupon_code, discount) VALUES ('febbf9f7-8b38-4166-ba36-a4d6c8d5da07', NULL, 'jonathan', 'jonathanlozada94@hotmail.com', '2321', '3213', '321321', '312', 980000, 0, 980000, 'paid', 'wompi', 'RUBI-febbf9f7-8b38-4166-ba36-a4d6c8d5da07', '2026-05-23 17:20:19.765885+00', '2026-05-23 17:21:57.273706+00', 'RUBI-febbf9f7-8b38-4166-ba36-a4d6c8d5da07', '12100060-1779556914-15811', '{"data": {"transaction": {"id": "12100060-1779556914-15811", "origin": null, "status": "APPROVED", "currency": "COP", "reference": "RUBI-febbf9f7-8b38-4166-ba36-a4d6c8d5da07", "created_at": "2026-05-23T17:21:55.197Z", "billing_data": {"legal_id": "1039232", "legal_id_type": "CC"}, "finalized_at": "2026-05-23T17:21:55.713Z", "redirect_url": "https://ruby-shop.lovable.app/checkout/confirmacion?ref=RUBI-febbf9f7-8b38-4166-ba36-a4d6c8d5da07", "customer_data": {"device_id": "3f910f131afb63bea5a7d11149d6f40b", "full_name": "jonathan", "browser_info": {"browser_tz": "300", "browser_language": "es-419", "browser_user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.4 Safari/605.1.15", "browser_color_depth": "24", "browser_screen_width": "1440", "browser_screen_height": "900"}, "phone_number": "+573175390953", "device_data_token": "eyJhbGciOiJIUzI1NiJ9.eyJjb21wcmVzc2VkIjoiZUp6VlZVMXYyemdRL1NzRVR5MmcycFF0SzdiMzVNUnRFalJ1alhVK0ZsZ1VBVVdPSk1JVXFhVW9PMm1RLzc1REtYSGRvbnZQWGdUcXpaQjg4OTZRZktLbDkvVk5BMjVSZ1BGMFRsZjJ1OUthRHljRFJ0NnR1RkRHMjZiOGcxd2FENW9nUUw1dXlGOGtadmZ4NVA3a1BWblV0WVk3eUQ0clAwelpaQkFQNGdsNTkvbmllblVWRWEyMlFNNUJiTzE3Y2d1dVVkWU1SeW5aOEp3N2RVaW4wYzhzbHR4ek9uK2ltYk43eEpCVVB3SHpYcUQ3WGI4WWhrYnBJTUdBYlhCY2NmRjEwLzBjSmNRTXR4aWNJQ3hocHdTRUdsL0xRcEE3VVNvUHdyY3VoRzdNMXRpOXdRQ1lRcGtBOWNVaG9ya3BXbDRFREpvUFNUeERURFVybXltTldNNTFBd0c0NXBrR2Z3UXNvZGw2VzlPNWR5MDhSN1RXM09mV1ZUMlRUdGdYQ1JaQ1FPMnZmck9QNFR0VmNHL2QydGthbkZmUW5OazJPRFlaUlhRUDJmblZMUmhwM1RIaER2NFRZWER3STBEdUF2d2FEbUlmWm5abW90VmljQncrV3FGUE9GL2ZITWMzSmNmNDJvRlF2ZWFqY1VSekIvKzBZTVRqd25EOTJObVlUQmxqRWZXcWd1KzJrM1pSZ1ZPQ0QwOXRZZEh6aURiQ0FaZzdKWDFKNTNHU3NGZm9BbFJSWXJVemRvQ1dLQlZtalpLSUNtdTNxTWhIRTZTWHZkRG9seFZjYjFBejFQS1hVQU5Ob1ByN29NSnlIMEF1VDMvQlMrN2tuanM0czBhMHpvWGk2SHo2MmxjcnFLeERBUG1oUVpYcU5tak9PSmFJM1V4clo2czZtSElVWENtQmJwYTlGb2VFM0JxUDNmdzNYVGpGTmJreFNsZ0paQlU2K3h6UEpoNGYwK0Q0QXZRT1BNcEh2a0FMQ0t6QWFFdS9SYlJ0WUNGUHNmenRvUXVsL1dMOXRlTUJvdTJoeVd2ZFlwZUgzWjZ3eGFyQVk3MzhSRzRWN05HeFVCcHFyV3JmSDZXMWRUNG9RcFpXdEJXZVZQSUoyNWdIMGhXYWV2MVlRNytVeHhIbWMrd1c1QmRtRDJ1WkIzL2JQRmNQSVlzRzREazY1SHA0OFArUjlDMmt2YkE3SzFFbUlQOERrcXF0M2pqTnJ2MGFtM3Z5VVJadlhkT1h1eXRybGZZZmxBbHMzdzVOUEhNN0pjSDIyelhoOGFycXBIdVJIalBvNzhycTZOY1dCZjdoOHRUMWQ2dThyUEFldXVENEpNM3BsRTl6SmtkWk5zM1NNUnZMbEtXTVR5R2ZzVmlPaFJRVHhrYlpPSkY1a2tLU1R2QWJQaUtOUjJNbVJjSVBUOTNsRWxjYjU3T1k1ZkU0NWprdWx3R2Y4Qk1aeDNFeWsybWVzSXcrL3d2eG1xOGsifQ.VIP72zSFaHIf7DUhPmjYrG8gWHakX0TlwG4zWHWJFU4"}, "customer_email": "jonathanlozada94@hotmail.com", "payment_method": {"type": "CARD", "extra": {"bin": "424242", "name": "VISA-4242", "brand": "VISA", "card_type": "CREDIT", "last_four": "4242", "card_holder": "jonathan", "is_three_ds": true, "unique_code": "bbf3f7907db26da85ab4d57213a668ba9d519a3f773ff63b2ae7003393da95bc", "country_iso2": "GB", "three_ds_auth": {"current_step": "AUTHENTICATION", "current_step_status": "COMPLETED"}, "three_ds_auth_type": null, "external_identifier": "Tj6OAZjtt5", "processor_response_code": "00"}, "token": "tok_test_2100060_74177820BE81c75b583fd9a7Df2e107A", "installments": 1, "is_click_to_pay": false}, "status_message": null, "amount_in_cents": 98000000, "payment_link_id": null, "shipping_address": null, "payment_source_id": null, "payment_method_type": "CARD"}}, "event": "transaction.updated", "sent_at": "2026-05-23T17:21:55.963Z", "signature": {"checksum": "95090059ba0f5f4f00d110fc272ea1171280e351283fb94323e64f52461f7a3b", "properties": ["transaction.id", "transaction.status", "transaction.amount_in_cents"]}, "timestamp": 1779556915, "environment": "test"}', '', 0);
INSERT INTO public.orders (id, user_id, customer_name, customer_email, customer_phone, city, address, notes, subtotal, shipping, total, status, payment_method, payment_reference, created_at, updated_at, wompi_reference, wompi_transaction_id, wompi_payload, coupon_code, discount) VALUES ('ef421dc5-d48c-40a6-8ff0-6bbac14914c0', '6e641938-7746-42c7-95bc-d68a3de7aed7', 'joadsa', '3232132@hotmail.com', '321321', '31232', '3232132@hotmail.com', '', 1090000, 0, 1090000, 'pending', 'wompi', 'RUBI-ef421dc5-d48c-40a6-8ff0-6bbac14914c0', '2026-05-24 23:24:02.626622+00', '2026-05-24 23:24:02.925655+00', 'RUBI-ef421dc5-d48c-40a6-8ff0-6bbac14914c0', '', '{}', '', 0);


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.products (id, slug, name, category, category_label, brand, material, price, discount_price, image, gallery, description, warranty, is_active, sort_order, created_at, updated_at, stock) VALUES ('f37e4667-4a8e-4a3b-98e2-51eb46670e85', 'cronografo-celeste', 'Cronógrafo Celeste', 'relojeria', 'Relojería', 'Rubí Atelier', 'Acero inoxidable 316L', 1290000, 1090000, '/products/product-1.jpg', '["/products/product-1.jpg", "/products/product-2.jpg", "/products/product-6.jpg"]', 'Un cronógrafo de líneas puras y movimiento preciso. La esfera plateada captura la luz como un eco discreto del tiempo que pasa.', '2 años de garantía oficial', true, 1, '2026-05-23 00:10:57.062057+00', '2026-05-23 00:10:57.062057+00', NULL);
INSERT INTO public.products (id, slug, name, category, category_label, brand, material, price, discount_price, image, gallery, description, warranty, is_active, sort_order, created_at, updated_at, stock) VALUES ('2cc6679f-b693-445f-a4c1-3b68846918a8', 'heritage-dorado', 'Heritage Dorado', 'relojeria', 'Relojería', 'Rubí Atelier', 'Caja en oro 18k, correa cuero italiano', 1850000, NULL, '/products/product-2.jpg', '["/products/product-2.jpg", "/products/product-1.jpg", "/products/product-6.jpg"]', 'Inspirado en la elegancia atemporal. Caja dorada y correa de cuero curtido a mano para acompañar cada momento importante.', '3 años de garantía oficial', true, 2, '2026-05-23 00:10:57.062057+00', '2026-05-23 00:10:57.062057+00', NULL);
INSERT INTO public.products (id, slug, name, category, category_label, brand, material, price, discount_price, image, gallery, description, warranty, is_active, sort_order, created_at, updated_at, stock) VALUES ('200cef8c-c6ac-4510-9b68-e04045b4c511', 'anillo-aurora', 'Anillo Aurora', 'joyeria', 'Joyería', 'Rubí Collection', 'Oro 18k con diamantes naturales', 2450000, 2190000, '/products/product-3.jpg', '["/products/product-3.jpg", "/products/product-5.jpg", "/products/product-4.jpg"]', 'Una pieza icónica: el diamante central rodeado por un halo de gemas pequeñas que refractan la luz en todos los ángulos.', 'Garantía de por vida en la pieza', true, 3, '2026-05-23 00:10:57.062057+00', '2026-05-23 00:10:57.062057+00', NULL);
INSERT INTO public.products (id, slug, name, category, category_label, brand, material, price, discount_price, image, gallery, description, warranty, is_active, sort_order, created_at, updated_at, stock) VALUES ('c9250320-9d0b-45de-a187-b248b3f7429e', 'pulsera-carmesi', 'Pulsera Carmesí', 'joyeria', 'Joyería', 'Rubí Collection', 'Oro 18k con rubí natural', 1690000, NULL, '/products/product-4.jpg', '["/products/product-4.jpg", "/products/product-3.jpg", "/products/product-5.jpg"]', 'Cadena dorada delicada con un rubí rojo profundo. Pensada para celebrar momentos que merecen recordarse.', '5 años de garantía', true, 4, '2026-05-23 00:10:57.062057+00', '2026-05-23 00:10:57.062057+00', NULL);
INSERT INTO public.products (id, slug, name, category, category_label, brand, material, price, discount_price, image, gallery, description, warranty, is_active, sort_order, created_at, updated_at, stock) VALUES ('b293b610-0303-4975-9e95-b179ee3d8dab', 'aretes-perla', 'Aretes Perla', 'joyeria', 'Joyería', 'Rubí Collection', 'Oro 18k con perlas naturales', 890000, 790000, '/products/product-5.jpg', '["/products/product-5.jpg", "/products/product-3.jpg", "/products/product-4.jpg"]', 'Perlas naturales en montura dorada minimalista. Una joya versátil para el día a día o las ocasiones especiales.', '2 años de garantía', true, 5, '2026-05-23 00:10:57.062057+00', '2026-05-23 00:10:57.062057+00', NULL);
INSERT INTO public.products (id, slug, name, category, category_label, brand, material, price, discount_price, image, gallery, description, warranty, is_active, sort_order, created_at, updated_at, stock) VALUES ('3997e39a-7993-403f-99ba-1a342de18acb', 'reloj-rose-gold', 'Reloj Rose Gold', 'relojeria', 'Relojería', 'Rubí Atelier', 'Acero con baño en oro rosa', 980000, NULL, '/products/product-6.jpg', '["/products/product-6.jpg", "/products/product-1.jpg", "/products/product-2.jpg"]', 'Tonos rosados, esfera limpia y un movimiento cuarzo confiable. Un reloj que combina con todo sin perder protagonismo.', '2 años de garantía oficial', true, 6, '2026-05-23 00:10:57.062057+00', '2026-05-23 00:10:57.062057+00', NULL);


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.order_items (id, order_id, product_id, product_name, product_slug, product_image, unit_price, qty, subtotal, created_at) VALUES ('fdd39bce-04d2-4d75-bb86-a56bf9f7df2e', 'f9ec266f-a271-4b3c-b081-b935c6b52e3f', 'f37e4667-4a8e-4a3b-98e2-51eb46670e85', 'Cronógrafo Celeste', 'cronografo-celeste', '/products/product-1.jpg', 1090000, 1, 1090000, '2026-05-23 03:13:20.715545+00');
INSERT INTO public.order_items (id, order_id, product_id, product_name, product_slug, product_image, unit_price, qty, subtotal, created_at) VALUES ('449806c3-3569-4fc1-8a0e-94b4cfdef4b0', '9dda4746-49ed-40eb-a072-ddd4ef7ba612', '200cef8c-c6ac-4510-9b68-e04045b4c511', 'Anillo Aurora', 'anillo-aurora', '/products/product-3.jpg', 2190000, 1, 2190000, '2026-05-23 03:25:22.643231+00');
INSERT INTO public.order_items (id, order_id, product_id, product_name, product_slug, product_image, unit_price, qty, subtotal, created_at) VALUES ('d6ed5c37-f565-49ef-8923-ca9a95a15c2f', '73bdf68d-0c47-48ad-a785-07253b66fb70', 'f37e4667-4a8e-4a3b-98e2-51eb46670e85', 'Cronógrafo Celeste', 'cronografo-celeste', '/products/product-1.jpg', 1090000, 1, 1090000, '2026-05-23 17:13:19.157951+00');
INSERT INTO public.order_items (id, order_id, product_id, product_name, product_slug, product_image, unit_price, qty, subtotal, created_at) VALUES ('2bf39a97-49b0-45e7-9a3b-a81b5ae7bb02', 'febbf9f7-8b38-4166-ba36-a4d6c8d5da07', '3997e39a-7993-403f-99ba-1a342de18acb', 'Reloj Rose Gold', 'reloj-rose-gold', '/products/product-6.jpg', 980000, 1, 980000, '2026-05-23 17:20:19.875418+00');
INSERT INTO public.order_items (id, order_id, product_id, product_name, product_slug, product_image, unit_price, qty, subtotal, created_at) VALUES ('873768c8-e594-488e-8afc-af52d2d1a0b9', 'ef421dc5-d48c-40a6-8ff0-6bbac14914c0', 'f37e4667-4a8e-4a3b-98e2-51eb46670e85', 'Cronógrafo Celeste', 'cronografo-celeste', '/products/product-1.jpg', 1090000, 1, 1090000, '2026-05-24 23:24:02.789881+00');


--
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.product_images (id, product_id, url, alt, sort_order, is_primary, created_at, updated_at) VALUES ('615adfad-d2fc-4170-9c48-5fc43db48dca', 'f37e4667-4a8e-4a3b-98e2-51eb46670e85', '/products/product-1.jpg', '', 0, true, '2026-05-23 01:10:58.626707+00', '2026-05-23 01:10:58.626707+00');
INSERT INTO public.product_images (id, product_id, url, alt, sort_order, is_primary, created_at, updated_at) VALUES ('cc1b3830-8428-4c89-b686-cb6437025567', '2cc6679f-b693-445f-a4c1-3b68846918a8', '/products/product-2.jpg', '', 0, true, '2026-05-23 01:10:58.626707+00', '2026-05-23 01:10:58.626707+00');
INSERT INTO public.product_images (id, product_id, url, alt, sort_order, is_primary, created_at, updated_at) VALUES ('8e3265d5-0529-4c8a-ab52-f829f10203f2', '200cef8c-c6ac-4510-9b68-e04045b4c511', '/products/product-3.jpg', '', 0, true, '2026-05-23 01:10:58.626707+00', '2026-05-23 01:10:58.626707+00');
INSERT INTO public.product_images (id, product_id, url, alt, sort_order, is_primary, created_at, updated_at) VALUES ('29bb72b7-81ee-4496-8e1a-25c4498c64d7', 'c9250320-9d0b-45de-a187-b248b3f7429e', '/products/product-4.jpg', '', 0, true, '2026-05-23 01:10:58.626707+00', '2026-05-23 01:10:58.626707+00');
INSERT INTO public.product_images (id, product_id, url, alt, sort_order, is_primary, created_at, updated_at) VALUES ('9e1e0cfb-73be-4ade-bd29-b42cb9e9f0ae', 'b293b610-0303-4975-9e95-b179ee3d8dab', '/products/product-5.jpg', '', 0, true, '2026-05-23 01:10:58.626707+00', '2026-05-23 01:10:58.626707+00');
INSERT INTO public.product_images (id, product_id, url, alt, sort_order, is_primary, created_at, updated_at) VALUES ('bd8bba03-363e-4897-9641-89d3012f2326', '3997e39a-7993-403f-99ba-1a342de18acb', '/products/product-6.jpg', '', 0, true, '2026-05-23 01:10:58.626707+00', '2026-05-23 01:10:58.626707+00');
INSERT INTO public.product_images (id, product_id, url, alt, sort_order, is_primary, created_at, updated_at) VALUES ('ee42a610-e35f-46a9-9ae1-e1f2c7a4bae1', 'f37e4667-4a8e-4a3b-98e2-51eb46670e85', '/products/product-1.jpg', '', 2, false, '2026-05-23 01:10:58.626707+00', '2026-05-23 01:10:58.626707+00');
INSERT INTO public.product_images (id, product_id, url, alt, sort_order, is_primary, created_at, updated_at) VALUES ('b2bf8c41-b8e7-4af5-9bcc-5cb81f4270b0', 'f37e4667-4a8e-4a3b-98e2-51eb46670e85', '/products/product-2.jpg', '', 3, false, '2026-05-23 01:10:58.626707+00', '2026-05-23 01:10:58.626707+00');
INSERT INTO public.product_images (id, product_id, url, alt, sort_order, is_primary, created_at, updated_at) VALUES ('4452bea3-ccd0-4ae4-8a82-02b43f8a1b6e', 'f37e4667-4a8e-4a3b-98e2-51eb46670e85', '/products/product-6.jpg', '', 4, false, '2026-05-23 01:10:58.626707+00', '2026-05-23 01:10:58.626707+00');
INSERT INTO public.product_images (id, product_id, url, alt, sort_order, is_primary, created_at, updated_at) VALUES ('c395b81d-cb49-45be-a9e5-bb0e02d98a4a', '2cc6679f-b693-445f-a4c1-3b68846918a8', '/products/product-2.jpg', '', 2, false, '2026-05-23 01:10:58.626707+00', '2026-05-23 01:10:58.626707+00');
INSERT INTO public.product_images (id, product_id, url, alt, sort_order, is_primary, created_at, updated_at) VALUES ('0f391dcb-f85a-405b-aafc-63350addc5e7', '2cc6679f-b693-445f-a4c1-3b68846918a8', '/products/product-1.jpg', '', 3, false, '2026-05-23 01:10:58.626707+00', '2026-05-23 01:10:58.626707+00');
INSERT INTO public.product_images (id, product_id, url, alt, sort_order, is_primary, created_at, updated_at) VALUES ('9e714089-8c66-4b4e-835b-34a332a9e32e', '2cc6679f-b693-445f-a4c1-3b68846918a8', '/products/product-6.jpg', '', 4, false, '2026-05-23 01:10:58.626707+00', '2026-05-23 01:10:58.626707+00');
INSERT INTO public.product_images (id, product_id, url, alt, sort_order, is_primary, created_at, updated_at) VALUES ('db6b01cc-b97d-4ce6-8c7d-2f6e0111d136', '200cef8c-c6ac-4510-9b68-e04045b4c511', '/products/product-3.jpg', '', 2, false, '2026-05-23 01:10:58.626707+00', '2026-05-23 01:10:58.626707+00');
INSERT INTO public.product_images (id, product_id, url, alt, sort_order, is_primary, created_at, updated_at) VALUES ('cfcbf8c8-9aed-484f-ae12-b891c76dc870', '200cef8c-c6ac-4510-9b68-e04045b4c511', '/products/product-5.jpg', '', 3, false, '2026-05-23 01:10:58.626707+00', '2026-05-23 01:10:58.626707+00');
INSERT INTO public.product_images (id, product_id, url, alt, sort_order, is_primary, created_at, updated_at) VALUES ('1927868c-eb7e-44fb-a794-3a88e0e845d5', '200cef8c-c6ac-4510-9b68-e04045b4c511', '/products/product-4.jpg', '', 4, false, '2026-05-23 01:10:58.626707+00', '2026-05-23 01:10:58.626707+00');
INSERT INTO public.product_images (id, product_id, url, alt, sort_order, is_primary, created_at, updated_at) VALUES ('53468e66-43a2-4cb7-b821-60f6bfcf6e0e', 'c9250320-9d0b-45de-a187-b248b3f7429e', '/products/product-4.jpg', '', 2, false, '2026-05-23 01:10:58.626707+00', '2026-05-23 01:10:58.626707+00');
INSERT INTO public.product_images (id, product_id, url, alt, sort_order, is_primary, created_at, updated_at) VALUES ('bf5674e6-d25b-45ed-acaa-f3889196924d', 'c9250320-9d0b-45de-a187-b248b3f7429e', '/products/product-3.jpg', '', 3, false, '2026-05-23 01:10:58.626707+00', '2026-05-23 01:10:58.626707+00');
INSERT INTO public.product_images (id, product_id, url, alt, sort_order, is_primary, created_at, updated_at) VALUES ('39843eaa-951f-4b2c-a4ff-c37af047cb3d', 'c9250320-9d0b-45de-a187-b248b3f7429e', '/products/product-5.jpg', '', 4, false, '2026-05-23 01:10:58.626707+00', '2026-05-23 01:10:58.626707+00');
INSERT INTO public.product_images (id, product_id, url, alt, sort_order, is_primary, created_at, updated_at) VALUES ('82d99e5a-70c8-4a0f-8ce4-6e5633e1de5e', 'b293b610-0303-4975-9e95-b179ee3d8dab', '/products/product-5.jpg', '', 2, false, '2026-05-23 01:10:58.626707+00', '2026-05-23 01:10:58.626707+00');
INSERT INTO public.product_images (id, product_id, url, alt, sort_order, is_primary, created_at, updated_at) VALUES ('ceac26cd-8f01-4134-8278-eceaa9c7b274', 'b293b610-0303-4975-9e95-b179ee3d8dab', '/products/product-3.jpg', '', 3, false, '2026-05-23 01:10:58.626707+00', '2026-05-23 01:10:58.626707+00');
INSERT INTO public.product_images (id, product_id, url, alt, sort_order, is_primary, created_at, updated_at) VALUES ('24609fb2-e805-43a6-8d37-87213b401389', 'b293b610-0303-4975-9e95-b179ee3d8dab', '/products/product-4.jpg', '', 4, false, '2026-05-23 01:10:58.626707+00', '2026-05-23 01:10:58.626707+00');
INSERT INTO public.product_images (id, product_id, url, alt, sort_order, is_primary, created_at, updated_at) VALUES ('6d6c1ce2-2fc6-4b3e-b454-825272ec155b', '3997e39a-7993-403f-99ba-1a342de18acb', '/products/product-6.jpg', '', 2, false, '2026-05-23 01:10:58.626707+00', '2026-05-23 01:10:58.626707+00');
INSERT INTO public.product_images (id, product_id, url, alt, sort_order, is_primary, created_at, updated_at) VALUES ('f82fb888-b113-4d70-ac10-fe4e46df543d', '3997e39a-7993-403f-99ba-1a342de18acb', '/products/product-1.jpg', '', 3, false, '2026-05-23 01:10:58.626707+00', '2026-05-23 01:10:58.626707+00');
INSERT INTO public.product_images (id, product_id, url, alt, sort_order, is_primary, created_at, updated_at) VALUES ('0a6e17e1-bf86-465e-b3ba-3ff8469fa723', '3997e39a-7993-403f-99ba-1a342de18acb', '/products/product-2.jpg', '', 4, false, '2026-05-23 01:10:58.626707+00', '2026-05-23 01:10:58.626707+00');


--
-- Data for Name: product_reviews; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.profiles (id, full_name, phone, city, address, created_at, updated_at) VALUES ('98310613-8071-4f0d-8c38-eb9af63b89ad', 'yeisone7@gmail.com', NULL, NULL, NULL, '2026-05-23 00:36:30.177728+00', '2026-05-23 00:36:30.177728+00');
INSERT INTO public.profiles (id, full_name, phone, city, address, created_at, updated_at) VALUES ('6e641938-7746-42c7-95bc-d68a3de7aed7', 'jonathanlozada94@hotmail.com', '3175390953', 'Bucaramanga', 'transversal 21 10 a 36', '2026-05-23 16:58:26.4572+00', '2026-05-23 16:59:38.735788+00');


--
-- Data for Name: promotions; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: site_content; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.site_content (key, data, updated_at) VALUES ('home_pillars', '{"items": [{"icon": "watch", "text": "Marcas que marcan tu tiempo.", "title": "Relojería"}, {"icon": "gem", "text": "Brillos que cuentan tu historia.", "title": "Joyería"}, {"icon": "shield", "text": "Productos originales, garantía y respaldo.", "title": "Confianza"}, {"icon": "bag", "text": "Asesoría personalizada en cada detalle.", "title": "Experiencia"}]}', '2026-05-23 01:24:16.12636+00');
INSERT INTO public.site_content (key, data, updated_at) VALUES ('home_emotional', '{"image": "", "title": "Cada pieza cuenta una historia. La tuya.", "cta_url": "/catalogo", "eyebrow": "El regalo perfecto", "cta_label": "Descubrir piezas con descuento"}', '2026-05-23 01:24:16.12636+00');
INSERT INTO public.site_content (key, data, updated_at) VALUES ('home_benefits', '{"items": [{"icon": "shield", "text": "Piezas certificadas. Atención dedicada en cada compra.", "title": "Confianza"}, {"icon": "sparkles", "text": "Hasta 5 años en relojería y joyería seleccionada.", "title": "Garantía"}, {"icon": "gem", "text": "Asesoría exclusiva para encontrar la pieza ideal.", "title": "Experiencia personalizada"}]}', '2026-05-23 01:24:16.12636+00');
INSERT INTO public.site_content (key, data, updated_at) VALUES ('home_featured', '{"title": "Piezas destacadas", "cta_url": "/catalogo", "eyebrow": "Selección Rubí", "cta_label": "Ver toda la colección →"}', '2026-05-23 01:24:16.12636+00');
INSERT INTO public.site_content (key, data, updated_at) VALUES ('home_categories_section', '{"title": "Dos universos, una visión", "eyebrow": "Colecciones"}', '2026-05-23 01:24:16.12636+00');
INSERT INTO public.site_content (key, data, updated_at) VALUES ('global_settings', '{"whatsapp": "", "announcement": "", "whatsapp_message": "Hola Rubí, me interesa esta pieza:", "global_discount_active": false, "global_discount_percent": 0}', '2026-05-23 02:42:19.997815+00');


--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.user_roles (id, user_id, role, created_at) VALUES ('c4f9ec22-9520-4114-8417-316af14c478f', '98310613-8071-4f0d-8c38-eb9af63b89ad', 'admin', '2026-05-23 00:36:30.177728+00');
INSERT INTO public.user_roles (id, user_id, role, created_at) VALUES ('b8c87d7c-de99-4492-bea4-7ffabf76e8b2', '6e641938-7746-42c7-95bc-d68a3de7aed7', 'admin', '2026-05-23 17:05:02.955505+00');


--
-- PostgreSQL database dump complete
--

\unrestrict WnptAZ2lhyg1sFLPTNJiycxjRMUrMcMad7TW9rmjytzdKehGm3tTOlp8QNGbbXH

