import logging

import stripe
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response

from orders.models import Order
from products.models import Product

logger = logging.getLogger(__name__)


@api_view(["GET"])
def stripe_config(request):
    return Response({"publishable_key": settings.STRIPE_PUBLISHABLE_KEY})


@api_view(["POST"])
def create_checkout_session(request):
    stripe.api_key = settings.STRIPE_SECRET_KEY

    items = request.data.get("items", [])
    order_id = request.data.get("order_id")

    if not items or not order_id:
        return Response(
            {"error": "Artikel und Bestellnummer erforderlich"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response(
            {"error": "Bestellung nicht gefunden"},
            status=status.HTTP_404_NOT_FOUND,
        )

    line_items = []
    for item in items:
        try:
            product = Product.objects.get(id=item["product_id"])
        except Product.DoesNotExist:
            return Response(
                {"error": f"Produkt {item['product_id']} nicht gefunden"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        line_items.append(
            {
                "price_data": {
                    "currency": "eur",
                    "product_data": {
                        "name": product.name,
                        "description": f"{product.card_count} Karten",
                    },
                    "unit_amount": int(product.price * 100),
                },
                "quantity": item["quantity"],
            }
        )

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=line_items,
            mode="payment",
            success_url=settings.STRIPE_SUCCESS_URL,
            cancel_url=settings.STRIPE_CANCEL_URL,
            customer_email=order.email,
            metadata={"order_id": str(order.id)},
        )

        order.stripe_session_id = session.id
        order.save()

        return Response({"session_id": session.id, "url": session.url})

    except stripe.error.StripeError as e:
        logger.error("Stripe error: %s", str(e))
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST,
        )


@csrf_exempt
@api_view(["POST"])
@authentication_classes([])
@permission_classes([])
def stripe_webhook(request):
    stripe.api_key = settings.STRIPE_SECRET_KEY
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except (ValueError, stripe.error.SignatureVerificationError) as e:
        logger.error("Webhook error: %s", str(e))
        return Response(status=status.HTTP_400_BAD_REQUEST)

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        order_id = session.get("metadata", {}).get("order_id")

        if order_id:
            try:
                order = Order.objects.get(id=order_id)
                order.status = Order.Status.PAID
                order.stripe_payment_intent = session.get("payment_intent", "")
                order.save()
                logger.info("Order %s marked as paid", order.order_number)
            except Order.DoesNotExist:
                logger.error("Order %s not found for webhook", order_id)

    return Response(status=status.HTTP_200_OK)
