var totalWeight = 0;
var totalWeightOther = 0;
var playerMaxWeight = 0;
var otherMaxWeight = 0;
var otherLabel = "";
var ClickedItemData = {};
var SelectedAttachment = null;
var AttachmentScreenActive = false;
var ControlPressed = false;
var disableRightMouse = false;
var selectedItem = null;
var IsDragging = false;
var CanMoveContext = false;
var UsingItemsFilter = false;

$(document).on("keydown", function () {
    if (event.repeat) {
        return;
    }
    switch (event.keyCode) {
        case 27: // ESC
            $(".ply-iteminfo-container").css("display", "none");
            Inventory.Close();
            break;
        case 9: // TAB
            $(".ply-iteminfo-container").css("display", "none");
            Inventory.Close();
            break;
        case 17: // TAB
            ControlPressed = true;
            break;
    }
});

$(document).on("dblclick", ".item-slot", function (e) {
    var ItemData = $(this).data("item");
    var ItemInventory = $(this).parent().attr("data-inventory");
    if (ItemData) {
        Inventory.Close();
        $.post(
            "https://qb-inventory/UseItem",
            JSON.stringify({
                inventory: ItemInventory,
                item: ItemData,
            })
        );
    }
});

$(document).on("keyup", function () {
    switch (event.keyCode) {
        case 17: // TAB
            ControlPressed = false;
            break;
    }
});

$(document).on("mouseenter", ".item-slot", function (e) {
    e.preventDefault();
    if($("#qbcore-inventory").css("display") == "block"){
        if ($(this).data("item") != null) {
            if ($('.item-shit').css('display') == 'none') {
                $(".ply-iteminfo-container").css('display', 'block');
                FormatItemInfo($(this).data("item"));
            } else {
                $(".ply-iteminfo-container").css('display', 'none');
                $('.item-shit').css('display', 'none');
                $('.item-split').css('display', 'none');
                $('.item-info-description').css('display', 'none');

            }
            
        } else {
            if ($(this).data("item") != null && $('.item-shit').css('display') !== 'flex'){
                $(".ply-iteminfo-container").css('display', 'none');
                $('.item-shit').css('display', 'none');
                $('.item-split').css('display', 'none');
                $('.item-info-description').css('display', 'block');
            }
        }
    }
});

$(document).on("mouseleave", ".item-slot", function(e){
    e.preventDefault();
    if ($('.item-shit').css('display') == 'none') {
        $(".ply-iteminfo-container").fadeOut(0)
        $('.item-shit').css('display', 'none');
        $('.item-split').css('display', 'none');
        $('.item-info-description').css('display', 'block');
    }
});

function GetFirstFreeSlot($toInv, $fromSlot) {
    var retval = null;
    $.each($toInv.find(".item-slot"), function (i, slot) {
        if ($(slot).data("item") === undefined) {
            if (retval === null) {
                retval = $(slot).attr("data-slot");
            }
        }
    });
    return retval;
}

function CanQuickMove() {
    var otherinventory = otherLabel.toLowerCase();
    var retval = true;
    if (otherinventory.split("-")[0] == "player") {
        retval = false;
    }
    return retval;
}

// function FilterItems() {

// }

var selected_item = null;
var selected_item_data = null;
$(".item-split-range").slider({
    range: "min",
    min: 0,
    max: 3,
    value: 1,
    slide: function (event, ui){
        $("#item-split-amount").html(ui.value)
    }
})
$(document).on("mousedown", function (event) {
    switch (event.which) {
        case 1:
            if ($('.item-shit').css('display') !== 'none') {
                $(".ply-iteminfo-container").fadeOut(100);
                $('.item-shit').css('display', 'none');
                $('.item-split').css('display', 'none');
                $('.item-info-description').css('display', 'none');
            }
        break;
    }
});
$(document).on("mousedown", "#Use", function (event) {
    switch (event.which) {
        case 1:
            fromData = selected_item.data("item");
            fromInventory = selected_item.parent().attr("data-inventory");
            Inventory.Close();
            $.post(
                "https://qb-inventory/UseItem",
                JSON.stringify({
                    inventory: fromInventory,
                    item: fromData,
                })
            );
            $(".ply-iteminfo-container").fadeOut(100);
            $('.item-shit').css('display', 'none');
            $('.item-split').css('display', 'none');
            $('.item-info-description').css('display', 'none');
        break
    }
});
$(document).on("mousedown", "#Give", function (event) {
    switch (event.which) {
        case 1:
            fromData = selected_item.data("item");
            fromInventory = selected_item.parent().attr("data-inventory");
            amount = $("#item-amount").val() || fromData.amount
            $.post(
                "https://qb-inventory/GiveItem",
                JSON.stringify({
                    inventory: fromInventory,
                    item: fromData,
                    amount: parseInt(amount),
                })
            );
            $(".ply-iteminfo-container").fadeOut(100);
            $('.item-shit').css('display', 'none');
            $('.item-split').css('display', 'none');
            $('.item-info-description').css('display', 'none');
        break
    }
});
$(document).on("mousedown", "#Drop", function (event) {
    switch (event.which) {
        case 1:
            fromData = selected_item.data("item");
            fromInventory = selected_item.parent().attr("data-inventory");
            amount = $("#item-amount").val() || fromData.amount
            let fromSlot = selected_item.attr("data-slot")

            $.post(
                "https://qb-inventory/DropItem",
                JSON.stringify({
                    inventory: fromInventory,
                    item: fromData,
                    slot: fromSlot,
                    amount: parseInt(amount),
                })
            );

            $(".ply-iteminfo-container").fadeOut(100);
            $('.item-shit').css('display', 'none');
            $('.item-split').css('display', 'none');
            $('.item-info-description').css('display', 'none');
        break
    }
});
$(document).on("mousedown", "#ItemSplit", function (event) {
    switch (event.which) {
        case 1:
            if ($('.item-shit').css('display') != 'none') {
                $('.item-split').css('display', 'flex');
                $('.item-info-description').css('display', 'none');
                $('.item-shit').css('display', 'none');
                $("#item-split-amount").html("1")
                $(".item-split-range").slider({
                    range: "min",
                    min: 0,
                    max: selected_item_data.amount - 1,
                    value: 1,
                    slide: function (event, ui){
                        $("#item-split-amount").html(ui.value)
                    }
                })
            }
        break
    }
});

$(document).on("mousedown", ".item-split-action", function (event) {
    switch (event.which) {
        case 1:
            if ($('.item-split').css('display') != 'none') {
                let freeSlot = GetFirstFreeSlot($(".player-inventory"), selected_item);

                let amount = parseInt($("#item-split-amount").html())
                if(amount>0){
                    let fromSlot = selected_item.attr("data-slot")
                    let fromInv = $(".player-inventory")
                    let toInv = fromInv
    
                    if (freeSlot === null) {
                        InventoryError($(".player-inventory"), selected_item.attr("data-slot"));
                        return;
                    }
                    if (amount >= 0) {
                        if (updateweights(fromSlot, freeSlot, fromInv, toInv, amount)) {
                            swap(fromSlot, freeSlot, fromInv, toInv, amount);
                        }
                    }
                }
                
                $(".ply-iteminfo-container").fadeOut(100);
                $('.item-shit').css('display', 'none');
                $('.item-split').css('display', 'none');
                $('.item-info-description').css('display', 'block');
            }
        break
    }
});
$(document).on("mousedown", ".item-split-cancel", function (event) {
    switch (event.which) {
        case 1:
            if ($('.item-split').css('display') != 'none') {
                $('.item-split').css('display', 'none');
                $('.item-info-description').css('display', 'none');
                $('.item-shit').css('display', 'flex');
            }
        break
    }
});
// $(document).on("mouseenter",  ".item-slot", function (event) {
//     if(selected_item != $(this)){
//         if ($('.item-shit').css('display') != 'none') {
//             $('.item-shit').css('display', 'none');
//             $('.item-split').css('display', 'none');
//             $('.item-info-description').css('display', 'block');
//             if ($(this).data('item') != undefined) {
//                 FormatItemInfo($(this).data("item"));
//             }
//         }
//     }
// })
$(document).on("mousedown", ".item-slot", function (event) {
    switch (event.which) {
        case 1:
            fromInventory = $(this).parent();
            if ($(fromInventory).attr("data-inventory") == "player") {
                if ($('.item-shit').css('display') == 'none') {
                    $('.item-shit').css('display', 'flex');
                    $('.item-info-description').css('display', 'none');
                    $('.item-split').css('display', 'none');
                    selected_item = $(this)
                    selected_item_data = $(this).data("item")
                    
                    topy = event.clientY
                    lefty = event.clientX
                } else {
                    $('.item-shit').css('display', 'none');
                    $('.item-split').css('display', 'none');
                    $('.item-info-description').css('display', 'block');
                    if ($(this).data('item') != undefined) {
                        FormatItemInfo($(this).data("item"));
                    }
                }
            }
        break 
        case 3:
            if (event.shiftKey) {
                fromSlot = $(this).attr("data-slot");
                fromInventory = $(this).parent();
                if ($(fromInventory).attr("data-inventory") == "player") {
                    toInventory = $(".other-inventory");
                } else {
                    toInventory = $(".player-inventory");
                }
                toSlot = GetFirstFreeSlot(toInventory, $(this));
                if ($(this).data("item") === undefined) {
                    return;
                }
                toAmount = $("#item-amount").val() || $(this).data("item").amount;
                
                if (CanQuickMove()) {
                    if (toSlot === null) {
                        InventoryError(fromInventory, fromSlot);
                        return;
                    }
                    if (fromSlot == toSlot && fromInventory == toInventory) {
                        return;
                    }
                    if (toAmount >= 0) {
                        if (updateweights(fromSlot, toSlot, fromInventory, toInventory, toAmount)) {
                            swap(fromSlot, toSlot, fromInventory, toInventory, toAmount);
                        }
                    }
                } else {
                    InventoryError(fromInventory, fromSlot);
                }
                break;
            } else {
                if ($('.item-shit').css('display') == 'none') {
                    $('.item-shit').css('display', 'flex');
                    $('.item-info-description').css('display', 'none');
                    selected_item = $(this)
                    selected_item_data = $(this).data("item")
                } else {
                    $('.item-shit').css('display', 'none');
                    $('.item-info-description').css('display', 'block');
                    if ($(this).data('item') != undefined) {
                        FormatItemInfo($(this).data("item"));
                    }
                }
            }
        }
    }
);

$(document).on("click", ".item-slot", function (e) {
    e.preventDefault();
    var ItemData = $(this).data("item");
    $(".combine-option-container").hide();
    if (ItemData !== null && ItemData !== undefined) {
        if (ItemData.name !== undefined) {
            if (ItemData.name.split("_")[0] == "weapon") {
                if (!$("#weapon-attachments").length) {
                    // $(".inv-options-list").append('<div class="inv-option-item" id="weapon-attachments"><p>ATTACHMENTS</p></div>');
                    $("#weapon-attachments").hide().fadeIn(250);
                    ClickedItemData = ItemData;
                } else if (ClickedItemData == ItemData) {
                    $("#weapon-attachments").fadeOut(250, function () {
                        $("#weapon-attachments").remove();
                    });
                    ClickedItemData = {};
                } else {
                    ClickedItemData = ItemData;
                }
            } else {
                ClickedItemData = {};
                if ($("#weapon-attachments").length) {
                    $("#weapon-attachments").fadeOut(250, function () {
                        $("#weapon-attachments").remove();
                    });
                }
            }
        } else {
            ClickedItemData = {};
            if ($("#weapon-attachments").length) {
                $("#weapon-attachments").fadeOut(250, function () {
                    $("#weapon-attachments").remove();
                });
            }
        }
    } else {
        ClickedItemData = {};
        if ($("#weapon-attachments").length) {
            $("#weapon-attachments").fadeOut(250, function () {
                $("#weapon-attachments").remove();
            });
        }
    }
});

$(document).on("click", "#inv-close", function (e) {
    e.preventDefault();
    Inventory.Close();
});

$(document).on("click", ".weapon-attachments-back", function (e) {
    e.preventDefault();
    $("#qbcore-inventory").css({ display: "block" });
    $("#qbcore-inventory").animate({ left: 0 + "vw" }, 200);
    $(".weapon-attachments-container").animate({ left: -100 + "vw" }, 200, function () {
        $(".weapon-attachments-container").css({ display: "none" });
    });
    AttachmentScreenActive = false;
});

function FormatAttachmentInfo(data) {
    $.post(
        "https://qb-inventory/GetWeaponData",
        JSON.stringify({
            weapon: data.name,
            ItemData: ClickedItemData,
        }),
        function (data) {
            var AmmoLabel = "9mm";
            var Durability = 100;
            if (data.WeaponData.ammotype == "AMMO_RIFLE") {
                AmmoLabel = "7.62";
            } else if (data.WeaponData.ammotype == "AMMO_SHOTGUN") {
                AmmoLabel = "12 Gauge";
            }
            if (ClickedItemData.info.quality !== undefined) {
                Durability = ClickedItemData.info.quality;
            }

            $(".weapon-attachments-container-title").html(data.WeaponData.label + " | " + AmmoLabel);
            $(".weapon-attachments-container-description").html(data.WeaponData.description);
            $(".weapon-attachments-container-details").html('<span style="font-weight: bold; letter-spacing: .1vh;">Name</span><br> ' + ClickedItemData.info.serie + '<br><br><span style="font-weight: bold; letter-spacing: .1vh;">Durability - ' + Durability.toFixed() + '% </span> <div class="weapon-attachments-container-detail-durability"><div class="weapon-attachments-container-detail-durability-total"></div></div>');
            $(".weapon-attachments-container-detail-durability-total").css({
                width: Durability + "%",
            });
            $(".weapon-attachments-container-image").attr("src", "./attachment_images/" + data.WeaponData.name + ".png");
            $(".weapon-attachments").html("");

            if (data.AttachmentData !== null && data.AttachmentData !== undefined) {
                if (data.AttachmentData.length > 0) {
                    $(".weapon-attachments-title").html('<span style="font-weight: bold; letter-spacing: .1vh;">Attachments</span>');
                    $.each(data.AttachmentData, function (i, attachment) {
                        var WeaponType = data.WeaponData.ammotype.split("_")[1].toLowerCase();
                        $(".weapon-attachments").append('<div class="item-slot weapon-attachment" id="weapon-attachment-' + i + '"> <div class="item-slot-label"><p>' + attachment.label + '</p></div> <div class="item-slot-img"><img src="./images/' + attachment.attachment + '.png"></div> </div>');
                        attachment.id = i;
                        $("#weapon-attachment-" + i).data("AttachmentData", attachment);
                    });
                } else {
                    $(".weapon-attachments-title").html('<span style="font-weight: bold; letter-spacing: .1vh;">This gun doesn\'t contain attachments</span>');
                }
            } else {
                $(".weapon-attachments-title").html('<span style="font-weight: bold; letter-spacing: .1vh;">This gun doesn\'t contain attachments</span>');
            }

            handleAttachmentDrag();
        }
    );
}

var AttachmentDraggingData = {};

function handleAttachmentDrag() {
    $(".weapon-attachment").draggable({
        helper: "clone",
        appendTo: "body",
        scroll: true,
        revertDuration: 0,
        revert: "invalid",
        cursorAt: { top: Math.floor($(".item-slot").outerHeight() / 2), left: Math.floor($(".item-slot").outerWidth() / 2) },
        start: function (event, ui) {
            var ItemData = $(this).data("AttachmentData");
            $(this).addClass("weapon-dragging-class");
            $(ui.helper).css({
                width: $(this).width(),
                height: $(this).height(),
            });
            AttachmentDraggingData = ItemData;
        },
        stop: function () {
            $(this).removeClass("weapon-dragging-class");
        },
    });
    $(".weapon-attachments-remove").droppable({
        accept: ".weapon-attachment",
        hoverClass: "weapon-attachments-remove-hover",
        drop: function (event, ui) {
            $.post(
                "https://qb-inventory/RemoveAttachment",
                JSON.stringify({
                    AttachmentData: AttachmentDraggingData,
                    WeaponData: ClickedItemData,
                }),
                function (data) {
                    if (data.Attachments !== null && data.Attachments !== undefined) {
                        if (data.Attachments.length > 0) {
                            $("#weapon-attachment-" + AttachmentDraggingData.id).fadeOut(150, function () {
                                $("#weapon-attachment-" + AttachmentDraggingData.id).remove();
                                AttachmentDraggingData = null;
                            });
                        } else {
                            $("#weapon-attachment-" + AttachmentDraggingData.id).fadeOut(150, function () {
                                $("#weapon-attachment-" + AttachmentDraggingData.id).remove();
                                AttachmentDraggingData = null;
                                $(".weapon-attachments").html("");
                            });
                            $(".weapon-attachments-title").html('<span style="font-weight: bold; letter-spacing: .1vh;">This gun doesn\'t contain attachments</span>');
                        }
                    } else {
                        $("#weapon-attachment-" + AttachmentDraggingData.id).fadeOut(150, function () {
                            $("#weapon-attachment-" + AttachmentDraggingData.id).remove();
                            AttachmentDraggingData = null;
                            $(".weapon-attachments").html("");
                        });
                        $(".weapon-attachments-title").html('<span style="font-weight: bold; letter-spacing: .1vh;">This gun doesn\'t contain attachments</span>');
                    }
                }
            );
        },
    });
}

$(document).on("click", "#weapon-attachments", function (e) {
    e.preventDefault();
    if (!Inventory.IsWeaponBlocked(ClickedItemData.name)) {
        $(".weapon-attachments-container").css({ display: "block" });
        $("#qbcore-inventory").animate(
            {
                left: 100 + "vw",
            },
            200,
            function () {
                $("#qbcore-inventory").css({ display: "none" });
            }
        );
        $(".weapon-attachments-container").animate(
            {
                left: 0 + "vw",
            },
            200
        );
        AttachmentScreenActive = true;
        FormatAttachmentInfo(ClickedItemData);
    } else {
        $.post(
            "https://qb-inventory/Notify",
            JSON.stringify({
                message: "Attachments are unavailable for this gun.",
                type: "error",
            })
        );
    }
});

function getGender(info) {
    return info.gender === 1 ? "Woman" : "Man";
}

function setItemInfo(title, description) {
    $(".item-info-title").html(`<p>${title}</p>`);
    $(".item-info-description").html(description);
}

function generateDescription(itemData) {
    if (itemData.type === "weapon") {
        let ammo = itemData.info.ammo ?? 0;
        return `<p><strong>Name : </strong><span>${itemData.info.serie}</span></p>
                    <p><strong>Ammunition: </strong><span>${ammo}</span></p>
                    <p>${itemData.description}</p>`;
    }

    if (itemData.name == "phone" && itemData.info.lbPhoneNumber) {
        return `<p><strong>Phone Number: </strong><span>${itemData.info.lbFormattedNumber ?? itemData.info.lbPhoneNumber}</span></p>`;
    }

    switch (itemData.name) {
        case "id_card":
            return `<p><strong>CSN: </strong><span>${itemData.info.citizenid}</span></p>
              <p><strong>First Name: </strong><span>${itemData.info.firstname}</span></p>
              <p><strong>Last Name: </strong><span>${itemData.info.lastname}</span></p>
              <p><strong>Birth Date: </strong><span>${itemData.info.birthdate}</span></p>
              <p><strong>Gender: </strong><span>${getGender(itemData.info)}</span></p>
              <p><strong>Nationality: </strong><span>${itemData.info.nationality}</span></p>`;
        case "driver_license":
            return `<p><strong>First Name: </strong><span>${itemData.info.firstname}</span></p>
            <p><strong>Last Name: </strong><span>${itemData.info.lastname}</span></p>
            <p><strong>Birth Date: </strong><span>${itemData.info.birthdate}</span>
            </p><p><strong>Licenses: </strong><span>${itemData.info.type}</span></p>`;
        case "weaponlicense":
            return `<p><strong>First Name: </strong><span>${itemData.info.firstname}</span></p>`;
        case "lawyerpass":
            return `<p><strong>Pass-ID: </strong><span>${itemData.info.id}</span></p>
            <p><strong>First Name: </strong><span>${itemData.info.firstname}</span></p>
            <p><strong>Last Name: </strong><span>${itemData.info.lastname}</span></p>
            <p><strong>CSN: </strong><span>${itemData.info.citizenid}</span></p>`;
        case "syphoningkit":
            return `<p><strong>A kit used to syphon gasoline from vehicles! </strong><span>${itemData.info.gasamount} Liters Inside.</span></p>`
        case "jerrycan":
            return `<p><strong>A Jerry Can, designed to hold fuel! </strong><span>${itemData.info.gasamount} Liters Inside.</span></p>`
        case "wateringcan":
            return `<p><strong>A Watering Can, designed to hold Water ! </strong><span>${itemData.info.durability} Liters Inside.</span></p>`
        case "harness":
            return `<p>${itemData.info.uses} uses left</p>`;
        case "ciggypack":
            return `<p><strong>Cigarettes : </strong><span>${itemData.info.uses} Liters Inside.</span></p>`
        case "lockpick":
            return `<p><strong>Remaining uses : </strong><span>${itemData.info.uses}</span></p>
            <p><strong>Type: </strong><span>${itemData.info.tier}</span></p>`
        case "drill":
            return `<p><strong>Remaining uses : </strong><span>${itemData.info.uses || 2}</span></p>`
        case "hack_device":
            return `<p><strong>Remaining uses : </strong><span>${itemData.info.uses || 2}</span></p>`
        case "filled_evidence_bag":
            if (itemData.info.type == "casing") {
                return `<p><strong>Evidence material: </strong><span>${itemData.info.label}</span></p>
                <p><strong>Type number: </strong><span>${itemData.info.ammotype}</span></p>
                <p><strong>Caliber: </strong><span>${itemData.info.ammolabel}</span></p>
                <p><strong>Name: </strong><span>${itemData.info.serie}</span></p>
                <p><strong>Crime scene: </strong><span>${itemData.info.street}</span></p><br /><p>${itemData.description}</p>`;
            } else if (itemData.info.type == "blood") {
                return `<p><strong>Evidence material: </strong><span>${itemData.info.label}</span></p>
                <p><strong>Blood type: </strong><span>${itemData.info.bloodtype}</span></p>
                <p><strong>DNA Code: </strong><span>${itemData.info.dnalabel}</span></p>
                <p><strong>Crime scene: </strong><span>${itemData.info.street}</span></p><br /><p>${itemData.description}</p>`;
            } else if (itemData.info.type == "fingerprint") {
                return `<p><strong>Evidence material: </strong><span>${itemData.info.label}</span></p>
                <p><strong>Fingerprint: </strong><span>${itemData.info.fingerprint}</span></p>
                <p><strong>Crime Scene: </strong><span>${itemData.info.street}</span></p><br /><p>${itemData.description}</p>`;
            } else if (itemData.info.type == "dna") {
                return `<p><strong>Evidence material: </strong><span>${itemData.info.label}</span></p>
                <p><strong>DNA Code: </strong><span>${itemData.info.dnalabel}</span></p><br /><p>${itemData.description}</p>`;
            }
        case "stickynote":
            return `<p>${itemData.info.label}</p>`;
        case "moneybag":
            return `<p><strong>Amount of cash: </strong><span>$${itemData.info.cash}</span></p>`;
        case "markedbills":
            return `<p><strong>Worth: </strong><span>$${itemData.info.worth}</span></p>`;
        case "visa":
            return `<p><strong>Card Holder: </strong><span>${itemData.info.name}</span></p>`;
        case "mastercard":
            return `<p><strong>Card Holder: </strong><span>${itemData.info.name}</span></p>`;
        case "labkey":
            return `<p>Lab: ${itemData.info.lab}</p>`;
        default:
            return itemData.description;
    }
}

function FormatItemInfo(itemData, mouse) {
    if (itemData && itemData.info !== "") {
        const description = generateDescription(itemData);
        $('.item-uselessinfo-weight').html(`<i class="fa-solid fa-weight-hanging"></i> ${((itemData.weight * itemData.amount / 1000)).toFixed(2)}KG`)
        $('.item-uselessinfo-decay').html(`<i class="fa-solid fa-bolt"></i> ${(Math.floor(itemData.info?.quality || 100))}%`)
        setItemInfo(itemData.label, description, mouse);
    } else {
        setItemInfo(itemData.label, itemData.description || "", mouse);
    }
}

$(document).on("wheel", function (e) {
    if (IsDragging) {
        var delta = e.originalEvent.deltaY;
        var $playerInventory = $(".player-inventory");
        var $otherInventory = $(".other-inventory");

        var playerInventoryOffset = $playerInventory.offset();
        var otherInventoryOffset = $otherInventory.offset();
        var mouseX = e.originalEvent.clientX;
        var mouseY = e.originalEvent.clientY;

        if (mouseX > playerInventoryOffset.left && mouseX < playerInventoryOffset.left + $playerInventory.width() && mouseY > playerInventoryOffset.top && mouseY < playerInventoryOffset.top + $playerInventory.height()) {
            $playerInventory.scrollTop($playerInventory.scrollTop() + delta);
        } else if (mouseX > otherInventoryOffset.left && mouseX < otherInventoryOffset.left + $otherInventory.width() && mouseY > otherInventoryOffset.top && mouseY < otherInventoryOffset.top + $otherInventory.height()) {
            $otherInventory.scrollTop($otherInventory.scrollTop() + delta);
        }

        if ((mouseX > playerInventoryOffset.left && mouseX < playerInventoryOffset.left + $playerInventory.width() && mouseY > playerInventoryOffset.top && mouseY < playerInventoryOffset.top + $playerInventory.height()) || (mouseX > otherInventoryOffset.left && mouseX < otherInventoryOffset.left + $otherInventory.width() && mouseY > otherInventoryOffset.top && mouseY < otherInventoryOffset.top + $otherInventory.height())) {
            e.preventDefault();
        }
    }
});

function handleDragDrop() {
    $(".item-drag").draggable({
        helper: "clone",
        appendTo: "body",
        scroll: false,
        revertDuration: 0,
        revert: "invalid",
        cancel: ".item-nodrag",
        cursorAt: { top: Math.floor($(".item-slot").outerHeight() / 2), left: Math.floor($(".item-slot").outerWidth() / 2) },
        start: function (event, ui) {
            IsDragging = true;
            $(this).find("img").css("filter", "brightness(50%)");
            $(ui.helper).css({
                width: $(this).width(),
                height: $(this).height(),
            });
            $(".ply-iteminfo-container").fadeOut(100);
            $('.item-shit').css('display', 'none');
            $('.item-info-description').css('display', 'block');
            var itemData = $(this).data("item");
            var dragAmount = $("#item-amount").val() || itemData.amount;
            if (dragAmount == 0) {
                if (itemData.price != null) {
                    $(this).find(".item-slot-amount p").html("0");
                    $(".ui-draggable-dragging")
                        .find(".item-slot-amount p")
                        .html("(" + itemData.amount + ") $" + itemData.price);
                    $(".ui-draggable-dragging").find(".item-slot-key").remove();
                    if ($(this).parent().attr("data-inventory") == "hotbar") {
                    }
                } else {
                    $(this).find(".item-slot-amount p").html("0");
                    $(".ui-draggable-dragging")
                        .find(".item-slot-amount p")
                        .html(itemData.amount);
                    $(".ui-draggable-dragging").find(".item-slot-key").remove();
                    if ($(this).parent().attr("data-inventory") == "hotbar") {
                    }
                }
            } else if (dragAmount > itemData.amount) {
                dragAmount = itemData.amount
                if (itemData.price != null) {
                    $(this)
                        .find(".item-slot-amount p")
                        .html("(" + itemData.amount + ") $" + itemData.price);
                    if ($(this).parent().attr("data-inventory") == "hotbar") {
                    }
                } else {
                    $(this)
                        .find(".item-slot-amount p")
                        .html(itemData.amount);
                    if ($(this).parent().attr("data-inventory") == "hotbar") {
                    }
                }
                // InventoryError($(this).parent(), $(this).attr("data-slot"));
            } else if (dragAmount > 0) {
                if (itemData.price != null) {
                    $(this)
                        .find(".item-slot-amount p")
                        .html("(" + itemData.amount + ") $" + itemData.price);
                    $(".ui-draggable-dragging")
                        .find(".item-slot-amount p")
                        .html("(" + itemData.amount + ") $" + itemData.price);
                    $(".ui-draggable-dragging").find(".item-slot-key").remove();
                    if ($(this).parent().attr("data-inventory") == "hotbar") {
                    }
                } else {
                    $(this)
                        .find(".item-slot-amount p")
                        .html(itemData.amount - dragAmount);
                    $(".ui-draggable-dragging")
                        .find(".item-slot-amount p")
                        .html(dragAmount);
                    $(".ui-draggable-dragging").find(".item-slot-key").remove();
                    if ($(this).parent().attr("data-inventory") == "hotbar") {
                    }
                }
            } else {
                if ($(this).parent().attr("data-inventory") == "hotbar") {
                }
                $(".ui-draggable-dragging").find(".item-slot-key").remove();
                $(this)
                    .find(".item-slot-amount p")
                    .html(itemData.amount);
                InventoryError($(this).parent(), $(this).attr("data-slot"));
            }
        },
        stop: function () {
            setTimeout(function () {
                IsDragging = false;
            }, 300);
            $(this).find("img").css("filter", "brightness(100%)");
        },
    });

    $(".item-slot").droppable({
        hoverClass: "item-slot-hoverClass",
        drop: function (event, ui) {
            setTimeout(function () {
                IsDragging = false;
            }, 300);
            fromSlot = ui.draggable.attr("data-slot");
            fromInventory = ui.draggable.parent();
            fromData = ui.draggable.data("item");
            toSlot = $(this).attr("data-slot");
            toInventory = $(this).parent();
            toAmount =  $("#item-amount").val() || fromData.amount;
            if(toAmount > fromData.amount){
                toAmount = fromData.amount;
            }
            if (fromSlot == toSlot && fromInventory == toInventory) {
                return;
            }
            if (toAmount >= 0) {
                if (updateweights(fromSlot, toSlot, fromInventory, toInventory, toAmount)) {
                    swap(fromSlot, toSlot, fromInventory, toInventory, toAmount);
                }
            }
        },
    });

    $("#item-use").droppable({
        hoverClass: "button-hover",
        drop: function (event, ui) {
            setTimeout(function () {
                IsDragging = false;
            }, 300);
            fromData = ui.draggable.data("item");
            fromInventory = ui.draggable.parent().attr("data-inventory");
            if (fromData.useable) {
                if (fromData.shouldClose) {
                    Inventory.Close();
                }
                $.post(
                    "https://qb-inventory/UseItem",
                    JSON.stringify({
                        inventory: fromInventory,
                        item: fromData,
                    })
                );
            }
        },
    });

    $("#item-drop").droppable({
        hoverClass: "item-slot-hoverClass",
        drop: function (event, ui) {
            setTimeout(function () {
                IsDragging = false;
            }, 300);
            fromData = ui.draggable.data("item");
            fromInventory = ui.draggable.parent().attr("data-inventory");
            amount = fromData.amount;
            $(this).css("background", "rgba(35,35,35, 0.7");
            $.post(
                "https://qb-inventory/DropItem",
                JSON.stringify({
                    inventory: fromInventory,
                    item: fromData,
                    amount: parseInt(amount),
                })
            );
        },
    });
}

function updateProgressBar(totalWeight, playerMaxWeight) {
    $('#player-inv-maxweight').html(`/${playerMaxWeight / 1000}`)
    $('#player-inv-weight').html(totalWeight / 1000)
}

function updateOtherProgressBar(totalWeightOther, otherMaxWeight) {
    $('#other-inv-maxweight').html(`/${otherMaxWeight / 1000}`)
    $('#other-inv-weight').html(totalWeightOther / 1000)
}

function updateweights($fromSlot, $toSlot, $fromInv, $toInv, $toAmount) {
    var otherinventory = otherLabel.toLowerCase();
    if (otherinventory.split("-")[0] == "dropped") {
        toData = $toInv.find("[data-slot=" + $toSlot + "]").data("item");
        if (toData !== null && toData !== undefined) {
            InventoryError($fromInv, $fromSlot);
            return false;
        }
    }

    if (($fromInv.attr("data-inventory") == "hotbar" && $toInv.attr("data-inventory") == "player") || ($fromInv.attr("data-inventory") == "player" && $toInv.attr("data-inventory") == "hotbar") || ($fromInv.attr("data-inventory") == "player" && $toInv.attr("data-inventory") == "player") || ($fromInv.attr("data-inventory") == "hotbar" && $toInv.attr("data-inventory") == "hotbar")) {
        return true;
    }

    if (($fromInv.attr("data-inventory").split("-")[0] == "itemshop" && $toInv.attr("data-inventory").split("-")[0] == "itemshop") || ($fromInv.attr("data-inventory") == "crafting" && $toInv.attr("data-inventory") == "crafting")) {
        itemData = $fromInv.find("[data-slot=" + $fromSlot + "]").data("item");
        if ($fromInv.attr("data-inventory").split("-")[0] == "itemshop") {
            $fromInv.find("[data-slot=" + $fromSlot + "]").html('<div class="item-slot-img"><img src="images/' + itemData.image + '" alt="' + itemData.name + '" /></div><div class="item-slot-amount"><p>(' + itemData.amount + ") $" + itemData.price + '</p></div><div class="item-slot-label"><p>' + itemData.label + "</p></div>");
        } else {
            $fromInv.find("[data-slot=" + $fromSlot + "]").html('<div class="item-slot-img"><img src="images/' + itemData.image + '" alt="' + itemData.name + '" /></div><div class="item-slot-amount"><p>' + itemData.amount + ')</p></div><div class="item-slot-label"><p>' + itemData.label + "</p></div>");
        }

        InventoryError($fromInv, $fromSlot);
        return false;
    }

    if ($toAmount == 0 && ($fromInv.attr("data-inventory").split("-")[0] == "itemshop" || $fromInv.attr("data-inventory") == "crafting")) {
        itemData = $fromInv.find("[data-slot=" + $fromSlot + "]").data("item");
        if ($fromInv.attr("data-inventory").split("-")[0] == "itemshop") {
            $fromInv.find("[data-slot=" + $fromSlot + "]").html('<div class="item-slot-img"><img src="images/' + itemData.image + '" alt="' + itemData.name + '" /></div><div class="item-slot-amount"><p>(' + itemData.amount + ") $" + itemData.price + '</p></div><div class="item-slot-label"><p>' + itemData.label + "</p></div>");
        } else {
            $fromInv.find("[data-slot=" + $fromSlot + "]").html('<div class="item-slot-img"><img src="images/' + itemData.image + '" alt="' + itemData.name + '" /></div><div class="item-slot-amount"><p>' + itemData.amount + ')</p></div><div class="item-slot-label"><p>' + itemData.label + "</p></div>");
        }

        InventoryError($fromInv, $fromSlot);
        return false;
    }

    if ($toInv.attr("data-inventory").split("-")[0] == "itemshop" || $toInv.attr("data-inventory") == "crafting") {
        itemData = $toInv.find("[data-slot=" + $toSlot + "]").data("item");
        if ($toInv.attr("data-inventory").split("-")[0] == "itemshop") {
            $toInv.find("[data-slot=" + $toSlot + "]").html('<div class="item-slot-img"><img src="images/' + itemData.image + '" alt="' + itemData.name + '" /></div><div class="item-slot-amount"><p>(' + itemData.amount + ") $" + itemData.price + '</p></div><div class="item-slot-label"><p>' + itemData.label + "</p></div>");
        } else {
            $toInv.find("[data-slot=" + $toSlot + "]").html('<div class="item-slot-img"><img src="images/' + itemData.image + '" alt="' + itemData.name + '" /></div><div class="item-slot-amount"><p>' + itemData.amount + ')</p></div><div class="item-slot-label"><p>' + itemData.label + "</p></div>");
        }

        InventoryError($fromInv, $fromSlot);
        return false;
    }

    if ($fromInv.attr("data-inventory") != $toInv.attr("data-inventory")) {
        fromData = $fromInv.find("[data-slot=" + $fromSlot + "]").data("item");
        toData = $toInv.find("[data-slot=" + $toSlot + "]").data("item");
        if ($toAmount == 0) {
            $toAmount = fromData.amount;
        }
        if (toData == null || fromData.name == toData.name) {
            if ($fromInv.attr("data-inventory") == "player" || $fromInv.attr("data-inventory") == "hotbar") {
                totalWeight = totalWeight - fromData.weight * $toAmount;
                totalWeightOther = totalWeightOther + fromData.weight * $toAmount;
            } else {
                totalWeight = totalWeight + fromData.weight * $toAmount;
                totalWeightOther = totalWeightOther - fromData.weight * $toAmount;
            }
        } else {
            if ($fromInv.attr("data-inventory") == "player" || $fromInv.attr("data-inventory") == "hotbar") {
                totalWeight = totalWeight - fromData.weight * $toAmount;
                totalWeight = totalWeight + toData.weight * toData.amount;

                totalWeightOther = totalWeightOther + fromData.weight * $toAmount;
                totalWeightOther = totalWeightOther - toData.weight * toData.amount;
            } else {
                totalWeight = totalWeight + fromData.weight * $toAmount;
                totalWeight = totalWeight - toData.weight * toData.amount;

                totalWeightOther = totalWeightOther - fromData.weight * $toAmount;
                totalWeightOther = totalWeightOther + toData.weight * toData.amount;
            }
        }
    }

    if (totalWeight > playerMaxWeight || (totalWeightOther > otherMaxWeight && $fromInv.attr("data-inventory").split("-")[0] != "itemshop" && $fromInv.attr("data-inventory") != "crafting")) {
        InventoryError($fromInv, $fromSlot);
        return false;
    }
    updateProgressBar(parseInt(totalWeight), playerMaxWeight);
    if ($fromInv.attr("data-inventory").split("-")[0] != "itemshop" && $toInv.attr("data-inventory").split("-")[0] != "itemshop" && $fromInv.attr("data-inventory") != "crafting" && $toInv.attr("data-inventory") != "crafting") {
        $("#other-inv-label").html(otherLabel);
        updateOtherProgressBar(parseInt(totalWeightOther), otherMaxWeight);
    }
    return true;
}

var combineslotData = null;

$(document).on("click", ".CombineItem", function (e) {
    e.preventDefault();
    if (combineslotData.toData.combinable.anim != null) {
        $.post(
            "https://qb-inventory/combineWithAnim",
            JSON.stringify({
                combineData: combineslotData.toData.combinable,
                usedItem: combineslotData.toData.name,
                requiredItem: combineslotData.fromData.name,
            })
        );
    } else {
        $.post(
            "https://qb-inventory/combineItem",
            JSON.stringify({
                reward: combineslotData.toData.combinable.reward,
                toItem: combineslotData.toData.name,
                fromItem: combineslotData.fromData.name,
            })
        );
    }
    Inventory.Close();
});

$(document).on("click", ".SwitchItem", function (e) {
    e.preventDefault();
    $(".combine-option-container").hide();

    optionSwitch(combineslotData.fromSlot, combineslotData.toSlot, combineslotData.fromInv, combineslotData.toInv, combineslotData.toAmount, combineslotData.toData, combineslotData.fromData);
});

function optionSwitch($fromSlot, $toSlot, $fromInv, $toInv, $toAmount, toData, fromData) {
    fromData.slot = parseInt($toSlot);

    $toInv.find("[data-slot=" + $toSlot + "]").data("item", fromData);

    $toInv.find("[data-slot=" + $toSlot + "]").addClass("item-drag");
    $toInv.find("[data-slot=" + $toSlot + "]").removeClass("item-nodrag");

    if ($toSlot < 6) {
        $toInv.find("[data-slot=" + $toSlot + "]").html('<div class="item-slot-key"><p>' + $toSlot + '</p></div><div class="item-slot-img"><img src="' + (isUrl(fromData.image) ? fromData.image : "images/" + fromData.image) + '" alt="' + fromData.name + '" /></div><div class="item-slot-amount"><p>' + fromData.amount  + ')</p></div><div class="item-slot-label"><p>' + fromData.label + "</p></div>");
    } else {
        $toInv.find("[data-slot=" + $toSlot + "]").html('<div class="item-slot-img"><img src="' + (isUrl(fromData.image) ? fromData.image : "images/" + fromData.image) + '" alt="' + fromData.name + '" /></div><div class="item-slot-amount"><p>' + fromData.amount + ')</p></div><div class="item-slot-label"><p>' + fromData.label + "</p></div>");
    }

    toData.slot = parseInt($fromSlot);

    $fromInv.find("[data-slot=" + $fromSlot + "]").addClass("item-drag");
    $fromInv.find("[data-slot=" + $fromSlot + "]").removeClass("item-nodrag");

    $fromInv.find("[data-slot=" + $fromSlot + "]").data("item", toData);

    if ($fromSlot < 6) {
        $fromInv.find("[data-slot=" + $fromSlot + "]").html('<div class="item-slot-key"><p>' + $fromSlot + '</p></div><div class="item-slot-img"><img src="' + (isUrl(toData.image) ? toData.image : "images/" + toData.image) + '" alt="' + toData.name + '" /></div><div class="item-slot-amount"><p>' + toData.amount + ')</p></div><div class="item-slot-label"><p>' + toData.label + "</p></div>");
    } else {
        $fromInv.find("[data-slot=" + $fromSlot + "]").html('<div class="item-slot-img"><img src="' + (isUrl(toData.image) ? toData.image : "images/" + toData.image) + '" alt="' + toData.name + '" /></div><div class="item-slot-amount"><p>' + toData.amount  + ')</p></div><div class="item-slot-label"><p>' + toData.label + "</p></div>");
    }

    $.post(
        "https://qb-inventory/SetInventoryData",
        JSON.stringify({
            fromInventory: $fromInv.attr("data-inventory"),
            toInventory: $toInv.attr("data-inventory"),
            fromSlot: $fromSlot,
            toSlot: $toSlot,
            fromAmount: $toAmount,
            toAmount: toData.amount,
        })
    );
}

function swap($fromSlot, $toSlot, $fromInv, $toInv, $toAmount) {
    fromData = $fromInv.find("[data-slot=" + $fromSlot + "]").data("item");
    toData = $toInv.find("[data-slot=" + $toSlot + "]").data("item");
    var otherinventory = otherLabel.toLowerCase();

    if (otherinventory.split("-")[0] == "dropped") {
        if (toData !== null && toData !== undefined) {
            InventoryError($fromInv, $fromSlot);
            handleDragDrop();
            return;
        }
    }

    if (fromData !== undefined && fromData.amount >= $toAmount) {
        if (fromData.unique && $toAmount > 1) {
            InventoryError($fromInv, $fromSlot);
            return;
        }

        if (($fromInv.attr("data-inventory") == "player" || $fromInv.attr("data-inventory") == "hotbar") && $toInv.attr("data-inventory").split("-")[0] == "itemshop" && $toInv.attr("data-inventory") == "crafting") {
            InventoryError($fromInv, $fromSlot);
            handleDragDrop();
            return;
        }

        if ($toAmount == 0 && $fromInv.attr("data-inventory").split("-")[0] == "itemshop" && $fromInv.attr("data-inventory") == "crafting") {
            InventoryError($fromInv, $fromSlot);
            handleDragDrop();
            return;
        } else if ($toAmount == 0) {
            $toAmount = fromData.amount;
        }
        if ((toData != undefined || toData != null) && toData.name == fromData.name && !fromData.unique) {
            var newData = [];
            newData.name = toData.name;
            newData.label = toData.label;
            newData.amount = parseInt($toAmount) + parseInt(toData.amount);
            newData.type = toData.type;
            newData.description = toData.description;
            newData.image = toData.image;
            newData.weight = toData.weight;
            newData.info = toData.info;
            newData.useable = toData.useable;
            newData.unique = toData.unique;
            newData.slot = parseInt($toSlot);

            if (newData.name == fromData.name) {
                if (newData.info.quality !== fromData.info.quality  ) {
                    InventoryError($fromInv, $fromSlot);
                    $.post(
                        "https://qb-inventory/Notify",
                        JSON.stringify({
                            message: "You can not stack items which are not the same quality.",
                            type: "error",
                        })
                    );
                    return;

                }
            }

            if (fromData.amount == $toAmount) {
                $toInv.find("[data-slot=" + $toSlot + "]").data("item", newData);

                $toInv.find("[data-slot=" + $toSlot + "]").addClass("item-drag");
                $toInv.find("[data-slot=" + $toSlot + "]").removeClass("item-nodrag");

                var ItemLabel = '<div class="item-slot-label"><p>' + newData.label + "</p></div>";
                // if (newData.name.split("_")[0] == "weapon") {
                    // if (!Inventory.IsWeaponBlocked(newData.name)) {
                        ItemLabel = '<div class="item-slot-quality"><div class="item-slot-quality-bar"><p>100</p></div></div><div class="item-slot-label"><p>' + newData.label + "</p></div>";
                    // }
                // }

                if ($toSlot < 6 && $toInv.attr("data-inventory") == "player") {
                    $toInv.find("[data-slot=" + $toSlot + "]").html('<div class="item-slot-key"><p>' + $toSlot + '</p></div><div class="item-slot-img"><img src="' + (isUrl(newData.image) ? newData.image : "images/" + newData.image) + '" alt="' + newData.name + '" /></div><div class="item-slot-amount"><p>' + (newData.amount !== 1 ? newData.amount : '') + "</p></div>" + ItemLabel);
                } else if ($toSlot == 41 && $toInv.attr("data-inventory") == "player") {
                    $toInv.find("[data-slot=" + $toSlot + "]").html('<div class="item-slot-key"><p>6</p></div><div class="item-slot-img"><img src="' + (isUrl(newData.image) ? newData.image : "images/" + newData.image) + '" alt="' + newData.name + '" /></div><div class="item-slot-amount"><p>' + (newData.amount !== 1 ? newData.amount : '') + "</p></div>" + ItemLabel);
                } else {
                    $toInv.find("[data-slot=" + $toSlot + "]").html('<div class="item-slot-img"><img src="' + (isUrl(newData.image) ? newData.image : "images/" + newData.image) + '" alt="' + newData.name + '" /></div><div class="item-slot-amount"><p>' + (newData.amount !== 1 ? newData.amount : '') + "</p></div>" + ItemLabel);
                }

                // if (newData.name.split("_")[0] == "weapon") {
                //     if (!Inventory.IsWeaponBlocked(newData.name)) {
                        if (newData.info.quality == undefined) {
                            newData.info.quality = 100.0;
                        }
                        var QualityColor = "rgb(12, 19, 228)";
                        if (newData.info.quality < 25) {
                            QualityColor = "rgb(192, 57, 43)";
                        } else if (newData.info.quality > 25 && newData.info.quality < 50) {
                            QualityColor = "rgb(12, 19, 228)";
                        } else if (newData.info.quality >= 50) {
                            QualityColor = "rgb(12, 19, 228)";
                        }
                        if (newData.info.quality !== undefined) {
                            qualityLabel = newData.info.quality.toFixed();
                        } else {
                            qualityLabel = newData.info.quality;
                        }
                        if (newData.info.quality == 0) {
                            qualityLabel = "BROKEN";
                        }
                        $toInv
                            .find("[data-slot=" + $toSlot + "]")
                            .find(".item-slot-quality-bar")
                            .css({
                                width: qualityLabel + "%",
                                "background-color": QualityColor,
                            })
                            .find("p")
                            .html(qualityLabel);
                //     }
                // }

                $fromInv.find("[data-slot=" + $fromSlot + "]").removeClass("item-drag");
                $fromInv.find("[data-slot=" + $fromSlot + "]").addClass("item-nodrag");

                $fromInv.find("[data-slot=" + $fromSlot + "]").removeData("item");
                $fromInv.find("[data-slot=" + $fromSlot + "]").html('<div class="item-slot-img"></div><div class="item-slot-label"><p>&nbsp;</p></div>');
            } else if (fromData.amount > $toAmount) {
                var newDataFrom = [];
                newDataFrom.name = fromData.name;
                newDataFrom.label = fromData.label;
                newDataFrom.amount = parseInt(fromData.amount - $toAmount);
                newDataFrom.type = fromData.type;
                newDataFrom.description = fromData.description;
                newDataFrom.image = fromData.image;
                newDataFrom.weight = fromData.weight;
                newDataFrom.price = fromData.price;
                newDataFrom.info = fromData.info;
                newDataFrom.useable = fromData.useable;
                newDataFrom.unique = fromData.unique;
                newDataFrom.slot = parseInt($fromSlot);

                $toInv.find("[data-slot=" + $toSlot + "]").data("item", newData);

                $toInv.find("[data-slot=" + $toSlot + "]").addClass("item-drag");
                $toInv.find("[data-slot=" + $toSlot + "]").removeClass("item-nodrag");

                var ItemLabel = '<div class="item-slot-label"><p>' + newData.label + "</p></div>";
                // if (newData.name.split("_")[0] == "weapon") {
                //     if (!Inventory.IsWeaponBlocked(newData.name)) {
                        ItemLabel = '<div class="item-slot-quality"><div class="item-slot-quality-bar"><p>100</p></div></div><div class="item-slot-label"><p>' + newData.label + "</p></div>";
                //     }
                // }

                if ($toSlot < 6 && $toInv.attr("data-inventory") == "player") {
                    $toInv.find("[data-slot=" + $toSlot + "]").html('<div class="item-slot-key"><p>' + $toSlot + '</p></div><div class="item-slot-img"><img src="' + (isUrl(newData.image) ? newData.image : "images/" + newData.image) + '" alt="' + newData.name + '" /></div><div class="item-slot-amount"><p>' + (newData.amount !== 1 ? newData.amount : '') + "</p></div>" + ItemLabel);
                } else if ($toSlot == 41 && $toInv.attr("data-inventory") == "player") {
                    $toInv.find("[data-slot=" + $toSlot + "]").html('<div class="item-slot-key"><p>6</p></div><div class="item-slot-img"><img src="' + (isUrl(newData.image) ? newData.image : "images/" + newData.image) + '" alt="' + newData.name + '" /></div><div class="item-slot-amount"><p>' + (newData.amount !== 1 ? newData.amount : '') + "</p></div>" + ItemLabel);
                } else {
                    $toInv.find("[data-slot=" + $toSlot + "]").html('<div class="item-slot-img"><img src="' + (isUrl(newData.image) ? newData.image : "images/" + newData.image) + '" alt="' + newData.name + '" /></div><div class="item-slot-amount"><p>' + (newData.amount !== 1 ? newData.amount : '') + "</p></div>" + ItemLabel);
                }

                // if (newData.name.split("_")[0] == "weapon") {
                //     if (!Inventory.IsWeaponBlocked(newData.name)) {
                        if (newData.info.quality == undefined) {
                            newData.info.quality = 100.0;
                        }
                        var QualityColor = "rgb(12, 19, 228)";
                        if (newData.info.quality < 25) {
                            QualityColor = "rgb(192, 57, 43)";
                        } else if (newData.info.quality > 25 && newData.info.quality < 50) {
                            QualityColor = "rgb(230, 126, 34)";
                        } else if (newData.info.quality >= 50) {
                            QualityColor = "rgb(12, 19, 228)";
                        }
                        if (newData.info.quality !== undefined) {
                            qualityLabel = newData.info.quality.toFixed();
                        } else {
                            qualityLabel = newData.info.quality;
                        }
                        if (newData.info.quality == 0) {
                            qualityLabel = "BROKEN";
                        }
                        $toInv
                            .find("[data-slot=" + $toSlot + "]")
                            .find(".item-slot-quality-bar")
                            .css({
                                width: qualityLabel + "%",
                                "background-color": QualityColor,
                            })
                            .find("p")
                            .html(qualityLabel);
                //     }
                // }

                $fromInv.find("[data-slot=" + $fromSlot + "]").data("item", newDataFrom);

                $fromInv.find("[data-slot=" + $fromSlot + "]").addClass("item-drag");
                $fromInv.find("[data-slot=" + $fromSlot + "]").removeClass("item-nodrag");

                if ($fromInv.attr("data-inventory").split("-")[0] == "itemshop") {
                    $fromInv.find("[data-slot=" + $fromSlot + "]").html('<div class="item-slot-img"><img src="' + (isUrl(newDataFrom.image) ? newDataFrom.image : "images/" + newDataFrom.image) + '" alt="' + newDataFrom.name + '" /></div><div class="item-slot-amount"><p>(' + newDataFrom.amount + ") $" + newDataFrom.price + '</p></div><div class="item-slot-label"><p>' + newDataFrom.label + "</p></div>");
                } else {
                    var ItemLabel = '<div class="item-slot-label"><p>' + newDataFrom.label + "</p></div>";
                    // if (newDataFrom.name.split("_")[0] == "weapon") {
                    //     if (!Inventory.IsWeaponBlocked(newDataFrom.name)) {
                            ItemLabel = '<div class="item-slot-quality"><div class="item-slot-quality-bar"><p>100</p></div></div><div class="item-slot-label"><p>' + newDataFrom.label + "</p></div>";
                    //     }
                    // }

                    if ($fromSlot < 6 && $fromInv.attr("data-inventory") == "player") {
                        $fromInv.find("[data-slot=" + $fromSlot + "]").html('<div class="item-slot-key"><p>' + $fromSlot + '</p></div><div class="item-slot-img"><img src="' + (isUrl(newDataFrom.image) ? newDataFrom.image : "images/" + newDataFrom.image) + '" alt="' + newDataFrom.name + '" /></div><div class="item-slot-amount"><p>' + (newDataFrom.amount !== 1 ? newDataFrom.amount : '') + "</p></div>" + ItemLabel);
                    } else if ($fromSlot == 41 && $fromInv.attr("data-inventory") == "player") {
                        $fromInv.find("[data-slot=" + $fromSlot + "]").html('<div class="item-slot-key"><p>6</p></div><div class="item-slot-img"><img src="' + (isUrl(newDataFrom.image) ? newDataFrom.image : "images/" + newDataFrom.image) + '" alt="' + newDataFrom.name + '" /></div><div class="item-slot-amount"><p>' + (newDataFrom.amount !== 1 ? newDataFrom.amount : '') + '</p></div>' + ItemLabel);
                    } else {
                        $fromInv.find("[data-slot=" + $fromSlot + "]").html('<div class="item-slot-img"><img src="' + (isUrl(newDataFrom.image) ? newDataFrom.image : "images/" + newDataFrom.image) + '" alt="' + newDataFrom.name + '" /></div><div class="item-slot-amount"><p>' + (newDataFrom.amount !== 1 ? newDataFrom.amount : '') + '</p></div>' + ItemLabel);
                    }

                    // if (newDataFrom.name.split("_")[0] == "weapon") {
                    //     if (!Inventory.IsWeaponBlocked(newDataFrom.name)) {
                            if (newDataFrom.info.quality == undefined) {
                                newDataFrom.info.quality = 100.0;
                            }
                            var QualityColor = "rgb(12, 19, 228)";
                            if (newDataFrom.info.quality < 25) {
                                QualityColor = "rgb(192, 57, 43)";
                            } else if (newDataFrom.info.quality > 25 && newDataFrom.info.quality < 50) {
                                QualityColor = "rgb(230, 126, 34)";
                            } else if (newDataFrom.info.quality >= 50) {
                                QualityColor = "rgb(12, 19, 228)";
                            }
                            if (newDataFrom.info.quality !== undefined) {
                                qualityLabel = newDataFrom.info.quality.toFixed();
                            } else {
                                qualityLabel = newDataFrom.info.quality;
                            }
                            if (newDataFrom.info.quality == 0) {
                                qualityLabel = "BROKEN";
                            }
                            $fromInv
                                .find("[data-slot=" + $fromSlot + "]")
                                .find(".item-slot-quality-bar")
                                .css({
                                    width: qualityLabel + "%",
                                    "background-color": QualityColor,
                                })
                                .find("p")
                                .html(qualityLabel);
                    //     }
                    // }
                }
            }
            $.post("https://qb-inventory/PlayDropSound", JSON.stringify({}));
            $.post(
                "https://qb-inventory/SetInventoryData",
                JSON.stringify({
                    fromInventory: $fromInv.attr("data-inventory"),
                    toInventory: $toInv.attr("data-inventory"),
                    fromSlot: $fromSlot,
                    toSlot: $toSlot,
                    fromAmount: $toAmount,
                })
            );
        } else {
            if (fromData.amount == $toAmount) {
                if (toData && toData.unique) {
                    InventoryError($fromInv, $fromSlot);
                    handleDragDrop();
                    return;
                }
                if (toData != undefined && toData.combinable != null && isItemAllowed(fromData.name, toData.combinable.accept)) {
                    $.post("https://qb-inventory/getCombineItem", JSON.stringify({ item: toData.combinable.reward }), function (item) {
                        $(".combine-option-text").html("<p>If you combine these items you get: <b>" + item.label + "</b></p>");
                    });
                    $(".combine-option-container").css("display", "flex");
                    $(".combine-option-container").fadeIn(100);
                    combineData = [];
                    combineslotData.fromData = fromData;
                    combineslotData.toData = toData;
                    combineslotData.fromSlot = $fromSlot;
                    combineslotData.toSlot = $toSlot;
                    combineslotData.fromInv = $fromInv;
                    combineslotData.toInv = $toInv;
                    combineslotData.toAmount = $toAmount;
                    handleDragDrop();
                    return;
                }

                fromData.slot = parseInt($toSlot);

                $toInv.find("[data-slot=" + $toSlot + "]").data("item", fromData);

                $toInv.find("[data-slot=" + $toSlot + "]").addClass("item-drag");
                $toInv.find("[data-slot=" + $toSlot + "]").removeClass("item-nodrag");

                var ItemLabel = '<div class="item-slot-label"><p>' + fromData.label + "</p></div>";
                // if (fromData.name.split("_")[0] == "weapon") {
                //     if (!Inventory.IsWeaponBlocked(fromData.name)) {
                        ItemLabel = '<div class="item-slot-quality"><div class="item-slot-quality-bar"><p>100</p></div></div><div class="item-slot-label"><p>' + fromData.label + "</p></div>";
                //     }
                // }

                if ($toSlot < 6 && $toInv.attr("data-inventory") == "player") {
                    $toInv.find("[data-slot=" + $toSlot + "]").html('<div class="item-slot-key"><p>' + $toSlot + '</p></div><div class="item-slot-img"><img src="' + (isUrl(fromData.image) ? fromData.image : "images/" + fromData.image) + '" alt="' + fromData.name + '" /></div><div class="item-slot-amount"><p>' + (fromData.amount !== 1 ? fromData.amount : '') + '</p></div>' + ItemLabel);
                } else if ($toSlot == 41 && $toInv.attr("data-inventory") == "player") {
                    $toInv.find("[data-slot=" + $toSlot + "]").html('<div class="item-slot-key"><p>6</p></div><div class="item-slot-img"><img src="' + (isUrl(fromData.image) ? fromData.image : "images/" + fromData.image) + '" alt="' + fromData.name + '" /></div><div class="item-slot-amount"><p>' + (fromData.amount !== 1 ? fromData.amount : '') + "</p></div>" + ItemLabel);
                } else {
                    $toInv.find("[data-slot=" + $toSlot + "]").html('<div class="item-slot-img"><img src="' + (isUrl(fromData.image) ? fromData.image : "images/" + fromData.image) + '" alt="' + fromData.name + '" /></div><div class="item-slot-amount"><p>' + (fromData.amount !== 1 ? fromData.amount : '') + '</p></div>' + ItemLabel);
                }

                // if (fromData.name.split("_")[0] == "weapon") {
                //     if (!Inventory.IsWeaponBlocked(fromData.name)) {
                        if (fromData.info.quality == undefined) {
                            fromData.info.quality = 100.0;
                        }
                        var QualityColor = "rgb(12, 19, 228)";
                        if (fromData.info.quality < 25) {
                            QualityColor = "rgb(192, 57, 43)";
                        } else if (fromData.info.quality > 25 && fromData.info.quality < 50) {
                            QualityColor = "rgb(230, 126, 34)";
                        } else if (fromData.info.quality >= 50) {
                            QualityColor = "rgb(12, 19, 228)";
                        }
                        if (fromData.info.quality !== undefined) {
                            qualityLabel = fromData.info.quality.toFixed();
                        } else {
                            qualityLabel = fromData.info.quality;
                        }
                        if (fromData.info.quality == 0) {
                            qualityLabel = "BROKEN";
                        }
                        $toInv
                            .find("[data-slot=" + $toSlot + "]")
                            .find(".item-slot-quality-bar")
                            .css({
                                width: qualityLabel + "%",
                                "background-color": QualityColor,
                            })
                            .find("p")
                            .html(qualityLabel);
                //     }
                // }

                if (toData != undefined) {
                    toData.slot = parseInt($fromSlot);

                    $fromInv.find("[data-slot=" + $fromSlot + "]").addClass("item-drag");
                    $fromInv.find("[data-slot=" + $fromSlot + "]").removeClass("item-nodrag");

                    $fromInv.find("[data-slot=" + $fromSlot + "]").data("item", toData);

                    var ItemLabel = '<div class="item-slot-label"><p>' + toData.label + "</p></div>";
                    // if (toData.name.split("_")[0] == "weapon") {
                    //     if (!Inventory.IsWeaponBlocked(toData.name)) {
                            ItemLabel = '<div class="item-slot-quality"><div class="item-slot-quality-bar"><p>100</p></div></div><div class="item-slot-label"><p>' + toData.label + "</p></div>";
                    //     }
                    // }

                    if ($fromSlot < 6 && $fromInv.attr("data-inventory") == "player") {
                        $fromInv.find("[data-slot=" + $fromSlot + "]").html('<div class="item-slot-key"><p>' + $fromSlot + '</p></div><div class="item-slot-img"><img src="' + (isUrl(toData.image) ? toData.image : "images/" + toData.image) + '" alt="' + toData.name + '" /></div><div class="item-slot-amount"><p>' + (toData.amount !== 1 ? toData.amount : '') + '</p></div>' + ItemLabel);
                    } else if ($fromSlot == 41 && $fromInv.attr("data-inventory") == "player") {
                        $fromInv.find("[data-slot=" + $fromSlot + "]").html('<div class="item-slot-key"><p>6</p></div><div class="item-slot-img"><img src="' + (isUrl(toData.image) ? toData.image : "images/" + toData.image) + '" alt="' + toData.name + '" /></div><div class="item-slot-amount"><p>' + (toData.amount !== 1 ? toData.amount : '') + '</p></div>' + ItemLabel);
                    } else {
                        $fromInv.find("[data-slot=" + $fromSlot + "]").html('<div class="item-slot-img"><img src="' + (isUrl(toData.image) ? toData.image : "images/" + toData.image) + '" alt="' + toData.name + '" /></div><div class="item-slot-amount"><p>' + (toData.amount !== 1 ? toData.amount : '') + '</p></div>' + ItemLabel);
                    }

                    // if (toData.name.split("_")[0] == "weapon") {
                    //     if (!Inventory.IsWeaponBlocked(toData.name)) {
                            if (toData.info.quality == undefined) {
                                toData.info.quality = 100.0;
                            }
                            var QualityColor = "rgb(12, 19, 228)";
                            if (toData.info.quality < 25) {
                                QualityColor = "rgb(192, 57, 43)";
                            } else if (toData.info.quality > 25 && toData.info.quality < 50) {
                                QualityColor = "rgb(230, 126, 34)";
                            } else if (toData.info.quality >= 50) {
                                QualityColor = "rgb(12, 19, 228)";
                            }
                            if (toData.info.quality !== undefined) {
                                qualityLabel = toData.info.quality.toFixed();
                            } else {
                                qualityLabel = toData.info.quality;
                            }
                            if (toData.info.quality == 0) {
                                qualityLabel = "BROKEN";
                            }
                            $fromInv
                                .find("[data-slot=" + $fromSlot + "]")
                                .find(".item-slot-quality-bar")
                                .css({
                                    width: qualityLabel + "%",
                                    "background-color": QualityColor,
                                })
                                .find("p")
                                .html(qualityLabel);
                    //     }
                    // }

                    $.post(
                        "https://qb-inventory/SetInventoryData",
                        JSON.stringify({
                            fromInventory: $fromInv.attr("data-inventory"),
                            toInventory: $toInv.attr("data-inventory"),
                            fromSlot: $fromSlot,
                            toSlot: $toSlot,
                            fromAmount: $toAmount,
                            toAmount: toData.amount,
                        })
                    );
                } else {
                    $fromInv.find("[data-slot=" + $fromSlot + "]").removeClass("item-drag");
                    $fromInv.find("[data-slot=" + $fromSlot + "]").addClass("item-nodrag");

                    $fromInv.find("[data-slot=" + $fromSlot + "]").removeData("item");

                    if ($fromSlot < 6 && $fromInv.attr("data-inventory") == "player") {
                        $fromInv.find("[data-slot=" + $fromSlot + "]").html('<div class="item-slot-key"><p>' + $fromSlot + '</p></div><div class="item-slot-img"></div><div class="item-slot-label"><p>&nbsp;</p></div>');

                    } else if ($fromSlot == 41 && $fromInv.attr("data-inventory") == "player") {
                        $fromInv.find("[data-slot=" + $fromSlot + "]").html('<div class="item-slot-key"><p>6</p></div><div class="item-slot-img"></div><div class="item-slot-label"><p>&nbsp;</p></div>');
                    } else {
                        $fromInv.find("[data-slot=" + $fromSlot + "]").html('<div class="item-slot-img"></div><div class="item-slot-label"><p>&nbsp;</p></div>');
                    }

                    $.post(
                        "https://qb-inventory/SetInventoryData",
                        JSON.stringify({
                            fromInventory: $fromInv.attr("data-inventory"),
                            toInventory: $toInv.attr("data-inventory"),
                            fromSlot: $fromSlot,
                            toSlot: $toSlot,
                            fromAmount: $toAmount,
                        })
                    );
                }
                $.post("https://qb-inventory/PlayDropSound", JSON.stringify({}));
            } else if (fromData.amount > $toAmount && (toData == undefined || toData == null)) {
                var newDataTo = [];
                newDataTo.name = fromData.name;
                newDataTo.label = fromData.label;
                newDataTo.amount = parseInt($toAmount);
                newDataTo.type = fromData.type;
                newDataTo.description = fromData.description;
                newDataTo.image = fromData.image;
                newDataTo.weight = fromData.weight;
                newDataTo.info = fromData.info;
                newDataTo.useable = fromData.useable;
                newDataTo.unique = fromData.unique;
                newDataTo.slot = parseInt($toSlot);

                $toInv.find("[data-slot=" + $toSlot + "]").data("item", newDataTo);

                $toInv.find("[data-slot=" + $toSlot + "]").addClass("item-drag");
                $toInv.find("[data-slot=" + $toSlot + "]").removeClass("item-nodrag");

                var ItemLabel = '<div class="item-slot-label"><p>' + newDataTo.label + "</p></div>";
                ItemLabel = '<div class="item-slot-quality"><div class="item-slot-quality-bar"><p>100</p></div></div><div class="item-slot-label"><p>' + newDataTo.label + "</p></div>";

                if ($toSlot < 6 && $toInv.attr("data-inventory") == "player") {
                    $toInv.find("[data-slot=" + $toSlot + "]").html('<div class="item-slot-key"><p>' + $toSlot + '</p></div><div class="item-slot-img"><img src="' + (isUrl(newDataTo.image) ? newDataTo.image : "images/" + newDataTo.image) + '" alt="' + newDataTo.name + '" /></div><div class="item-slot-amount"><p>' + (newDataTo.amount !== 1 ? newDataTo.amount : '') + "</p></div>" + ItemLabel);
                } else if ($toSlot == 41 && $toInv.attr("data-inventory") == "player") {
                    $toInv.find("[data-slot=" + $toSlot + "]").html('<div class="item-slot-key"><p>6</p></div><div class="item-slot-img"><img src="' + (isUrl(newDataTo.image) ? newDataTo.image : "images/" + newDataTo.image) + '" alt="' + newDataTo.name + '" /></div><div class="item-slot-amount"><p>' + (newDataTo.amount !== 1 ? newDataTo.amount : '') + '</p></div>' + ItemLabel);
                } else {
                    $toInv.find("[data-slot=" + $toSlot + "]").html('<div class="item-slot-img"><img src="' + (isUrl(newDataTo.image) ? newDataTo.image : "images/" + newDataTo.image) + '" alt="' + newDataTo.name + '" /></div><div class="item-slot-amount"><p>' + (newDataTo.amount !== 1 ? newDataTo.amount : '') + "</p></div>" + ItemLabel);
                }

                // if (newDataTo.name.split("_")[0] == "weapon") {
                //     if (!Inventory.IsWeaponBlocked(newDataTo.name)) {
                        if (newDataTo.info.quality == undefined) {
                            newDataTo.info.quality = 100.0;
                        }
                        var QualityColor = "rgb(12, 19, 228)";
                        if (newDataTo.info.quality < 25) {
                            QualityColor = "rgb(192, 57, 43)";
                        } else if (newDataTo.info.quality > 25 && newDataTo.info.quality < 50) {
                            QualityColor = "rgb(230, 126, 34)";
                        } else if (newDataTo.info.quality >= 50) {
                            QualityColor = "rgb(12, 19, 228)";
                        }
                        if (newDataTo.info.quality !== undefined) {
                            qualityLabel = newDataTo.info.quality.toFixed();
                        } else {
                            qualityLabel = newDataTo.info.quality;
                        }
                        if (newDataTo.info.quality == 0) {
                            qualityLabel = "BROKEN";
                        }
                        $toInv
                            .find("[data-slot=" + $toSlot + "]")
                            .find(".item-slot-quality-bar")
                            .css({
                                width: qualityLabel + "%",
                                "background-color": QualityColor,
                            })
                            .find("p")
                            .html(qualityLabel);
                //     }
                // }

                var newDataFrom = [];
                newDataFrom.name = fromData.name;
                newDataFrom.label = fromData.label;
                newDataFrom.amount = parseInt(fromData.amount - $toAmount);
                newDataFrom.type = fromData.type;
                newDataFrom.description = fromData.description;
                newDataFrom.image = fromData.image;
                newDataFrom.weight = fromData.weight;
                newDataFrom.price = fromData.price;
                newDataFrom.info = fromData.info;
                newDataFrom.useable = fromData.useable;
                newDataFrom.unique = fromData.unique;
                newDataFrom.slot = parseInt($fromSlot);

                $fromInv.find("[data-slot=" + $fromSlot + "]").data("item", newDataFrom);

                $fromInv.find("[data-slot=" + $fromSlot + "]").addClass("item-drag");
                $fromInv.find("[data-slot=" + $fromSlot + "]").removeClass("item-nodrag");

                if ($fromInv.attr("data-inventory").split("-")[0] == "itemshop") {
                    $fromInv.find("[data-slot=" + $fromSlot + "]").html('<div class="item-slot-img"><img src="' + (isUrl(newDataFrom.image) ? newDataFrom.image : "images/" + newDataFrom.image) + '" alt="' + newDataFrom.name + '" /></div><div class="item-slot-amount"><p>(' + newDataFrom.amount + ") $" + newDataFrom.price + '</p></div><div class="item-slot-label"><p>' + newDataFrom.label + "</p></div>");
                } else {
                    var ItemLabel = '<div class="item-slot-label"><p>' + newDataFrom.label + "</p></div>";
                    ItemLabel = '<div class="item-slot-quality"><div class="item-slot-quality-bar"><p>100</p></div></div><div class="item-slot-label"><p>' + newDataFrom.label + "</p></div>";
                    if ($fromSlot < 6 && $fromInv.attr("data-inventory") == "player") {
                        $fromInv.find("[data-slot=" + $fromSlot + "]").html('<div class="item-slot-key"><p>' + $fromSlot + '</p></div><div class="item-slot-img"><img src="' + (isUrl(newDataFrom.image) ? newDataFrom.image : "images/" + newDataFrom.image) + '" alt="' + newDataFrom.name + '" /></div><div class="item-slot-amount"><p>' + (newDataFrom.amount !== 1 ? newDataFrom.amount : '') + "</p></div>" + ItemLabel);
                    } else if ($fromSlot == 41 && $fromInv.attr("data-inventory") == "player") {
                        $fromInv.find("[data-slot=" + $fromSlot + "]").html('<div class="item-slot-key"><p>6</p></div><div class="item-slot-img"><img src="' + (isUrl(newDataFrom.image) ? newDataFrom.image : "images/" + newDataFrom.image) + '" alt="' + newDataFrom.name + '" /></div><div class="item-slot-amount"><p>' + (newDataFrom.amount !== 1 ? newDataFrom.amount : '') + "</p></div>" + ItemLabel);
                    } else {
                        $fromInv.find("[data-slot=" + $fromSlot + "]").html('<div class="item-slot-img"><img src="' + (isUrl(newDataFrom.image) ? newDataFrom.image : "images/" + newDataFrom.image) + '" alt="' + newDataFrom.name + '" /></div><div class="item-slot-amount"><p>' + (newDataFrom.amount !== 1 ? newDataFrom.amount : '') + "</p></div>" + ItemLabel);
                    }

                    // if (newDataFrom.name.split("_")[0] == "weapon") {
                    //     if (!Inventory.IsWeaponBlocked(newDataFrom.name)) {
                            if (newDataFrom.info.quality == undefined) {
                                newDataFrom.info.quality = 100.0;
                            }
                            var QualityColor = "rgb(12, 19, 228)";
                            if (newDataFrom.info.quality < 25) {
                                QualityColor = "rgb(192, 57, 43)";
                            } else if (newDataFrom.info.quality > 25 && newDataFrom.info.quality < 50) {
                                QualityColor = "rgb(230, 126, 34)";
                            } else if (newDataFrom.info.quality >= 50) {
                                QualityColor = "rgb(12, 19, 228)";
                            }
                            if (newDataFrom.info.quality !== undefined) {
                                qualityLabel = newDataFrom.info.quality.toFixed();
                            } else {
                                qualityLabel = newDataFrom.info.quality;
                            }
                            if (newDataFrom.info.quality == 0) {
                                qualityLabel = "BROKEN";
                            }
                            $fromInv
                                .find("[data-slot=" + $fromSlot + "]")
                                .find(".item-slot-quality-bar")
                                .css({
                                    width: qualityLabel + "%",
                                    "background-color": QualityColor,
                                })
                                .find("p")
                                .html(qualityLabel);
                    //     }
                    // }
                }
                $.post("https://qb-inventory/PlayDropSound", JSON.stringify({}));
                $.post(
                    "https://qb-inventory/SetInventoryData",
                    JSON.stringify({
                        fromInventory: $fromInv.attr("data-inventory"),
                        toInventory: $toInv.attr("data-inventory"),
                        fromSlot: $fromSlot,
                        toSlot: $toSlot,
                        fromAmount: $toAmount,
                    })
                );
            } else {
                InventoryError($fromInv, $fromSlot);
            }
        }
    } else {
    }
    handleDragDrop();
}

function isItemAllowed(item, allowedItems) {
    var retval = false;
    $.each(allowedItems, function (index, i) {
        if (i == item) {
            retval = true;
        }
    });
    return retval;
}

function InventoryError($elinv, $elslot) {
    $elinv
        .find("[data-slot=" + $elslot + "]")
        .css("background", "rgba(156, 20, 20, 0.5)")
        .css("transition", "background 500ms");
    
    let ourSlot = $elinv
        .find("[data-slot=" + $elslot + "]")

    let ourData = ourSlot.data('item')

    ourSlot.find(".item-slot-amount p").html(ourData.amount);
    setTimeout(function () {
        $elinv.find("[data-slot=" + $elslot + "]").css("background", `rgba(255, 255, 255, 0.07)`);
        
        
    }, 500);
    $.post("https://qb-inventory/PlayDropFail", JSON.stringify({}));
}

var requiredItemOpen = false;

(() => {
    Inventory = {};

    Inventory.slots = 40;

    Inventory.dropslots = 30;
    Inventory.droplabel = "Drop";
    Inventory.dropmaxweight = 100000;

    Inventory.Error = function () {
        $.post("https://qb-inventory/PlayDropFail", JSON.stringify({}));
    };

    Inventory.IsWeaponBlocked = function (WeaponName) {
        var DurabilityBlockedWeapons = ["weapon_unarmed"];

        var retval = false;
        $.each(DurabilityBlockedWeapons, function (i, name) {
            if (name == WeaponName) {
                retval = true;
            }
        });
        return retval;
    };

    Inventory.QualityCheck = function (item, IsHotbar, IsOtherInventory) {
        // if (!Inventory.IsWeaponBlocked(item.name)) {
        //     if (item.name.split("_")[0] == "weapon") {
                if (item.info.quality == undefined) {
                    item.info.quality = 100;
                }
                var QualityColor = "rgb(12, 19, 228)";
                if (item.info.quality < 25) {
                    QualityColor = "rgb(192, 57, 43)";
                } else if (item.info.quality > 25 && item.info.quality < 50) {
                    QualityColor = "rgb(230, 126, 34)";
                } else if (item.info.quality >= 50) {
                    QualityColor = "rgb(12, 19, 228)";
                }
                if (item.info.quality !== undefined) {
                    qualityLabel = item.info.quality.toFixed();
                } else {
                    qualityLabel = item.info.quality;
                }
                if (item.info.quality == 0) {
                    qualityLabel = "BROKEN";
                    if (!IsOtherInventory) {
                        if (!IsHotbar) {
                            $(".ply-hotbar-inventory")
                                .find("[data-slot=" + item.slot + "]")
                                .find(".item-slot-quality-bar")
                                .css({
                                    height: "100%",
                                    "background-color": QualityColor,
                                })
                                .find("p")
                                .html(qualityLabel);
                            $(".player-inventory")
                                .find("[data-slot=" + item.slot + "]")
                                .find(".item-slot-quality-bar")
                                .css({
                                    height: "100%",
                                    "background-color": QualityColor,
                                })
                                .find("p")
                                .html(qualityLabel);
                        } else {
                            $(".z-hotbar-inventory")
                                .find("[data-zhotbarslot=" + item.slot + "]")
                                .find(".item-slot-quality-bar")
                                .css({
                                    height: "100%",
                                    "background-color": QualityColor,
                                })
                                .find("p")
                                .html(qualityLabel);
                        }
                    } else {
                        $(".other-inventory")
                            .find("[data-slot=" + item.slot + "]")
                            .find(".item-slot-quality-bar")
                            .css({
                                height: "100%",
                                "background-color": QualityColor,
                            })
                            .find("p")
                            .html(qualityLabel);
                    }
                } else {
                    if (!IsOtherInventory) {
                        if (!IsHotbar) {
                            $(".ply-hotbar-inventory")
                                .find("[data-slot=" + item.slot + "]")
                                .find(".item-slot-quality-bar")
                                .css({
                                    height: "100%",
                                    "background-color": QualityColor,
                                })
                                .find("p")
                                .html(qualityLabel);
                            $(".player-inventory")
                                .find("[data-slot=" + item.slot + "]")
                                .find(".item-slot-quality-bar")
                                .css({
                                    width: qualityLabel + "%",
                                    "background-color": QualityColor,
                                })
                                .find("p")
                                .html(qualityLabel);
                        } else {
                            $(".z-hotbar-inventory")
                                .find("[data-zhotbarslot=" + item.slot + "]")
                                .find(".item-slot-quality-bar")
                                .css({
                                    width: qualityLabel + "%",
                                    "background-color": QualityColor,
                                })
                                .find("p")
                                .html(qualityLabel);
                        }
                    } else {
                        $(".other-inventory")
                            .find("[data-slot=" + item.slot + "]")
                            .find(".item-slot-quality-bar")
                            .css({
                                width: qualityLabel + "%",
                                "background-color": QualityColor,
                            })
                            .find("p")
                            .html(qualityLabel);
                    }
                }
        //     }
        // }
    };
    function commafy( num ) {
        var str = num.toString().split('.');
        if (str[0].length >= 5) {
            str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, '$1,');
        }
        if (str[1] && str[1].length >= 5) {
            str[1] = str[1].replace(/(\d{3})/g, '$1 ');
        }
        return str.join('.');
    }
    isUrl = function (url) {
        try {
            new URL(url);
            return true;
        } catch (_) {
            return false;
        }    
    },

    Inventory.Open = function (data) {
        UsingItemsFilter = false;
        totalWeight = 0;
        totalWeightOther = 0;
        $('.main-inventory-inputmeow').val('');
        $('.main-inventory-boxes').removeClass('box-brighter-background');
        $('.item-slot').removeClass('item-blur')
        $('.item-slot').draggable({ disabled: false });          
        $("#info-stateid").html("#" + data.pid);
        $("#info-bank").html(data.bank + "$");
        $("#info-cash").html(data.cash + "$");
        $("#info-apartment").html(data.apartment);
        $("#info-gang").html(data.gang);
        $("#info-job").html(data.job);
        $("#info-garde").html(data.garde);
        $("#info-firstname").html(data.firstname);
        $("#info-lastname").html(data.lastname);
        $("#info-num").html(data.numberplayer);
        $(".ply-iteminfo-container").css("display", "none");
        $('.item-shit').css('display', 'none');
        $('.item-info-description').css('display', 'block');
        $(".player-inventory").find(".item-slot").remove();
        $(".ply-hotbar-inventory").find(".item-slot").remove();
        if (requiredItemOpen) {
            $(".requiredItem-container").hide();
            requiredItemOpen = false;
        }
        $("#qbcore-inventory").fadeIn(300);
        if (data.other != null && data.other != "") {
            $(".other-inventory").attr("data-inventory", data.other.name);
        } else {
            $(".other-inventory").attr("data-inventory", 0);
        }
        for (i = 1; i < 6; i++) {
            $(".player-inventory").append('<div class="item-slot" data-slot="' + i + '"><div class="item-slot-key"><p>' + i + '</p></div><div class="item-slot-amount"><p>&nbsp;</p></div><div class="item-slot-img"></div><div class="item-slot-label"><p>&nbsp;</p></div></div>');
        }
        for (i = 6; i < data.slots + 1; i++) {
            if (i == 41) {
                $(".player-inventory").append('<div class="item-slot" data-slot="' + i + '"><div class="item-slot-key"><p>6</p></div><div class="item-slot-amount"><p>&nbsp;</p></div><div class="item-slot-img"></div><div class="item-slot-label"><p>&nbsp;</p></div></div>');
            } else {
                $(".player-inventory").append('<div class="item-slot" data-slot="' + i + '"><div class="item-slot-amount"><p>&nbsp;</p></div><div class="item-slot-img"></div><div class="item-slot-label"><p>&nbsp;</p></div></div>');
            }
        }

        if (data.other != null && data.other != "") {
            for (i = 1; i < data.other.slots + 1; i++) {
                $(".other-inventory").append('<div class="item-slot" data-slot="' + i + '"><div class="item-slot-amount"><p>&nbsp;</p></div><div class="item-slot-img"></div><div class="item-slot-label"><p>&nbsp;</p></div></div>');
            }
        } else {
            for (i = 1; i < Inventory.dropslots + 1; i++) {
                $(".other-inventory").append('<div class="item-slot" data-slot="' + i + '"><div class="item-slot-amount"><p>&nbsp;</p></div><div class="item-slot-img"></div><div class="item-slot-label"><p>&nbsp;</p></div></div>');
            }
        }

        if (data.inventory !== null) {
            $.each(data.inventory, function (i, item) {
                if (item != null) {
                    totalWeight += item.weight * item.amount;
                    var ItemLabel = '<div class="item-slot-label"><p>' + item.label + "</p></div>";
                    ItemLabel = '<div class="item-slot-quality"><div class="item-slot-quality-bar"><p>100</p></div></div><div class="item-slot-label"><p>' + item.label + "</p></div>";
                    if (item.slot < 6) {
                        $(".player-inventory")
                            .find("[data-slot=" + item.slot + "]")
                            .addClass("item-drag");
                        $(".player-inventory")
                            .find("[data-slot=" + item.slot + "]")
                            .html('<div class="item-slot-key"><p>' + item.slot + '</p></div></div><div class="item-slot-img"><img src="images/' + item.image + '" alt="' + item.name + '" /></div><div class="item-slot-amount"><p>' + item.amount + "</p></div>" + ItemLabel);
                        $(".player-inventory")
                            .find("[data-slot=" + item.slot + "]")
                            .data("item", item);
                    } else if (item.slot == 41) {
                        $(".player-inventory")
                            .find("[data-slot=" + item.slot + "]")
                            .addClass("item-drag");
                        $(".player-inventory")
                            .find("[data-slot=" + item.slot + "]")
                            .html('<div class="item-slot-key"><p>6</p></div></div><div class="item-slot-img"><img src="images/' + item.image + '" alt="' + item.name + '" /></div><div class="item-slot-amount"><p>' + item.amount + "</p></div>" + ItemLabel);
                        $(".player-inventory")
                            .find("[data-slot=" + item.slot + "]")
                            .data("item", item);
                    } else {
                        $(".player-inventory")
                            .find("[data-slot=" + item.slot + "]")
                            .addClass("item-drag");
                        $(".player-inventory")
                            .find("[data-slot=" + item.slot + "]")
                            .html('<div class="item-slot-img"><img src="images/' + item.image + '" alt="' + item.name + '" /></div><div class="item-slot-amount"><p>' + item.amount + "</p></div>" + ItemLabel);
                        $(".player-inventory")
                            .find("[data-slot=" + item.slot + "]")
                            .data("item", item);
                    }
                    Inventory.QualityCheck(item, false, false);
                }
            });
        }

        if (data.other != null && data.other != "" && data.other.name != "none-inv" && data.other.inventory != null) {
            $(".other-inv-info").show();
            $(".oth-inv-container").show();
            $(".player-information-flex").css({"left": "66.6%"});
            $(".player-header").css({"left": "66.3%"});
            $.each(data.other.inventory, function (i, item) {
                if (item != null) {
                    totalWeightOther += item.weight * item.amount;
                    var ItemLabel = '<div class="item-slot-label"><p>' + item.label + "</p></div>";
                    ItemLabel = '<div class="item-slot-quality"><div class="item-slot-quality-bar"><p>100</p></div></div><div class="item-slot-label"><p>' + item.label + "</p></div>";
                    $(".other-inventory")
                        .find("[data-slot=" + item.slot + "]")
                        .addClass("item-drag");
                    if (item.price != null) {
                        $(".other-inventory")
                            .find("[data-slot=" + item.slot + "]")
                            .html('<div class="item-slot-img"><img src="images/' + item.image + '" alt="' + item.name + '" /></div><div class="item-slot-amount"><p>(' + item.amount + ") $" + item.price + "</p></div>" + ItemLabel);
                    } else {
                        $(".other-inventory")
                            .find("[data-slot=" + item.slot + "]")
                            .html('<div class="item-slot-img"><img src="images/' + item.image + '" alt="' + item.name + '" /></div><div class="item-slot-amount"><p>' + item.amount + "</p></div>" + ItemLabel);
                    }
                    $(".other-inventory")
                        .find("[data-slot=" + item.slot + "]")
                        .data("item", item);
                    Inventory.QualityCheck(item, false, true);
                }
            });
        } else {
            $(".other-inv-info").hide();
            $(".oth-inv-container").hide();
            $(".player-information-flex").css({"left": "36.3%"});
            $(".player-header").css({"left": "36.0%"});
        }
        playerMaxWeight = data.maxweight;
        if (data.other != null) {
            var name = data.other.name.toString();
            var icon = '<i class="fa-solid fa-car"></i>'
            if (name.split("-")[0] == "stash") {
                icon = '<i class="fa-solid fa-box-open"></i>'
            }
            if (name != null && (name.split("-")[0] == "itemshop" || name == "crafting")) {
                $("#other-inv-label").html(data.other.label);
            } else {
                $('#other-inv-icon').html(icon)
                $("#first-other-inv-label").html(data.other.label.substring(0, data.other.label.indexOf('-')));
                $("#second-other-inv-label").html(data.other.label.split('-')[1]);
            }
            otherMaxWeight = data.other.maxweight;
            otherLabel = data.other.label;
            updateOtherProgressBar(totalWeightOther, data.other.maxweight);
        } else {
            otherMaxWeight = Inventory.dropmaxweight;
            otherLabel = Inventory.droplabel;
            $('#other-inv-icon').html(icon)
            $("#first-other-inv-label").html(otherLabel);
            updateOtherProgressBar(totalWeightOther, otherMaxWeight);
        }

        $.each(data.maxammo, function (index, ammotype) {
            $("#" + index + "_ammo")
                .find(".ammo-box-amount")
                .css({ height: "0%" });
        });

        if (data.Ammo !== null) {
            $.each(data.Ammo, function (i, amount) {
                var Handler = i.split("_");
                var Type = Handler[1].toLowerCase();
                if (amount > data.maxammo[Type]) {
                    amount = data.maxammo[Type];
                }
                var Percentage = (amount / data.maxammo[Type]) * 100;

                $("#" + Type + "_ammo")
                    .find(".ammo-box-amount")
                    .css({ height: Percentage + "%" });
                $("#" + Type + "_ammo")
                    .find("span")
                    .html(amount + "x");
            });
        }
        if (data.inventory !== null) {
            $.each(data.inventory, function(i, item) {
                if (item !== null) {
                    if (item.amount == 1) {
                        var $itemSlotAmount = $(".player-inventory").find("[data-slot=" + item.slot + "] .item-slot-amount");
                        $itemSlotAmount.html('');
                    }
                    $(".player-inventory").find("[data-slot=" + item.slot + "]").addClass("item-drag");
                    if (isUrl(item.image)) {
                        var $itemSlotImg = $(".player-inventory").find("[data-slot=" + item.slot + "] .item-slot-img");
                        $itemSlotImg.html('<img src="' + item.image + '" alt="' + item.name + '" />');
                    }
                }
            });
        }
        if (data.other != null && data.other != "" && data.other.name != "none-inv" && data.other.inventory != null) {
            $.each(data.other.inventory, function(i, item) {
                if (item !== null) {
                    if (item.amount == 1) {
                        var $itemSlotAmount = $(".player-inventory").find("[data-slot=" + item.slot + "] .item-slot-amount");
                        $itemSlotAmount.html('');
                    }
                    if (isUrl(item.image)) {
                        var $otherItemSlotImg = $(".other-inventory").find("[data-slot=" + item.slot + "] .item-slot-img");        
                        $otherItemSlotImg.html('<img src="' + item.image + '" alt="' + item.name + '" />');
                    }
                }
            });
        }     
        console.log($(".player-inventory .item-slot").length)   
        handleDragDrop();
    };
    Inventory.Close = function () {
        $('.main-inventory-boxes').removeClass('box-brighter-background');
        $('.item-slot').removeClass('item-blur')
        $('.item-slot').draggable({ disabled: false });          
        UsingItemsFilter = false;
        $('.item-shit').css('display', 'none');
        $('.item-info-description').css('display', 'block');
        $(".item-slot").css("border", "1px solid rgba(255, 255, 255, 0.1)");
        $(".hotbar-inv-container").css("display", "block");
        $(".ply-iteminfo-container").css("display", "none");
        $("#qbcore-inventory").fadeOut(300);
        $(".combine-option-container").hide();
        $("#other-inv-progressbar").progressbar({ value: 0 });
        $("#other-inv-weight-value").html("");
        $(".item-slot").remove();
        if ($("#rob-money").length) {
            $("#rob-money").remove();
        }
        $.post("https://qb-inventory/CloseInventory", JSON.stringify({}));

        if (AttachmentScreenActive) {
            $(".weapon-attachments-container").css({ display: "none" });
            AttachmentScreenActive = false;
        }

        if (ClickedItemData !== null) {
            $("#weapon-attachments").fadeOut(250, function () {
                $("#weapon-attachments").remove();
                ClickedItemData = {};
            });
        }
    };

    Inventory.Update = function (data) {
        totalWeight = 0;
        totalWeightOther = 0;
        $(".player-inventory").find(".item-slot").remove();
        $(".ply-hotbar-inventory").find(".item-slot").remove();
        if (data.error) {
            Inventory.Error();
        }
        for (i = 1; i < 6; i++) {
            $(".player-inventory").append('<div class="item-slot" data-slot="' + i + '"><div class="item-slot-key"><p>' + i + '</p></div><div class="item-slot-img"></div><div class="item-slot-label"><p>&nbsp;</p></div></div>');
        }
        for (i = 6; i < data.slots + 1; i++) {
            if (i == 41) {
                $(".player-inventory").append('<div class="item-slot" data-slot="' + i + '"><div class="item-slot-key"><p>6</p></div><div class="item-slot-img"></div><div class="item-slot-label"><p>&nbsp;</p></div></div>');
            } else {
                $(".player-inventory").append('<div class="item-slot" data-slot="' + i + '"><div class="item-slot-img"></div><div class="item-slot-label"><p>&nbsp;</p></div></div>');
            }
        }

        $.each(data.inventory, function (i, item) {
            if (item != null) {
                totalWeight += item.weight * item.amount;
                if (item.slot < 6) {
                    $(".player-inventory")
                        .find("[data-slot=" + item.slot + "]")
                        .addClass("item-drag");
                    $(".player-inventory")
                        .find("[data-slot=" + item.slot + "]")
                        .html('<div class="item-slot-key"><p>' + item.slot + '</p></div><div class="item-slot-img"><img src="' + (isUrl(item.image) ? item.image : "images/" + item.image) + '" alt="' + item.name + '" /></div><div class="item-slot-amount"><p>' + item.amount + '</p></div><div class="item-slot-label"><p>' + item.label + "</p></div>");
                    $(".player-inventory")
                        .find("[data-slot=" + item.slot + "]")
                        .data("item", item);
                } else if (item.slot == 41) {
                    $(".player-inventory")
                        .find("[data-slot=" + item.slot + "]")
                        .addClass("item-drag");
                    $(".player-inventory")
                        .find("[data-slot=" + item.slot + "]")
                        .html('<div class="item-slot-key"><p>6</p></div><div class="item-slot-img"><img src="' + (isUrl(item.image) ? item.image : "images/" + item.image) + '" alt="' + item.name + '" /></div><div class="item-slot-amount"><p>' + item.amount + '</p></div><div class="item-slot-label"><p>' + item.label + "</p></div>");
                    $(".player-inventory")
                        .find("[data-slot=" + item.slot + "]")
                        .data("item", item);
                } else {
                    $(".player-inventory")
                        .find("[data-slot=" + item.slot + "]")
                        .addClass("item-drag");
                    $(".player-inventory")
                        .find("[data-slot=" + item.slot + "]")
                        .html('<div class="item-slot-img"><img src="' + (isUrl(item.image) ? item.image : "images/" + item.image) + '" alt="' + item.name + '" /></div><div class="item-slot-amount"><p>' + item.amount + '</p></div><div class="item-slot-label"><p>' + item.label + "</p></div>");
                    $(".player-inventory")
                        .find("[data-slot=" + item.slot + "]")
                        .data("item", item);
                }
            }
        });
        updateProgressBar(totalWeight, data.maxweight);
        handleDragDrop();
    };

    Inventory.ToggleHotbar = function (data) {
        if (data.open) {
            $(".z-hotbar-inventory").html("");
            for (i = 1; i < 6; i++) {
                var elem = '<div class="item-slot" data-zhotbarslot="' + i + '"> <div class="item-slot-key"><p>' + i + '</p></div><div class="item-slot-img"></div><div class="item-slot-label"><p>&nbsp;</p></div></div>';
                $(".z-hotbar-inventory").append(elem);
            }
            // var elem = '<div class="item-slot" data-zhotbarslot="41"> <div class="item-slot-key"><p>6</p></div><div class="item-slot-img"></div><div class="item-slot-label"><p>&nbsp;</p></div></div>';
            // $(".z-hotbar-inventory").append(elem);
            $.each(data.items, function (i, item) {
                if (item != null) {
                    var ItemLabel = '<div class="item-slot-label"><p>' + item.label + "</p></div>";
                    ItemLabel = '<div class="item-slot-quality"><div class="item-slot-quality-bar"><p>100</p></div></div><div class="item-slot-label"><p>' + item.label + "</p></div>";
                    if (item.slot == 41) {
                        $(".z-hotbar-inventory")
                            .find("[data-zhotbarslot=" + item.slot + "]")
                            .html('<div class="item-slot-key"><p>' + item.slot + '</p></div><div class="item-slot-img"><img src="' + (isUrl(item.image) ? item.image : "images/" + item.image) + '" alt="' + item.name + '" /></div><div class="item-slot-amount"><p>' + item.amount + '</p></div>' + ItemLabel);
                    } else {
                        $(".z-hotbar-inventory")
                            .find("[data-zhotbarslot=" + item.slot + "]")
                            .html('<div class="item-slot-key"><p>' + item.slot + '</p></div><div class="item-slot-img"><img src="' + (isUrl(item.image) ? item.image : "images/" + item.image) + '" alt="' + item.name + '" /></div><div class="item-slot-amount"><p>' + item.amount + '</p></div>' + ItemLabel);
                    }
                    Inventory.QualityCheck(item, true, false);
                }
            });
            $(".z-hotbar-inventory").fadeIn(150);
        } else {
            $(".z-hotbar-inventory").fadeOut(150, function () {
                $(".z-hotbar-inventory").html("");
            });
        }
    };

    Inventory.UseItem = function (data) {
        $(".itembox-container").hide();
        $(".itembox-container").fadeIn(250);
        $("#itembox-action").html("<p>Used</p>");
        $("#itembox-label").html("<p>" + data.item.label + "</p>");
        $("#itembox-image").html('<div class="item-slot-img"><img src="'+isUrl(data.item.image) ? data.item.image :  +'images/' + data.item.image + '" alt="' + data.item.name + '" /></div>');
        setTimeout(function () {
            $(".itembox-container").fadeOut(250);
        }, 2000);
    };

    var itemBoxtimer = null;
    var requiredTimeout = null;

    Inventory.itemBox = function (data) {
        if (itemBoxtimer !== null) {
            clearTimeout(itemBoxtimer);
        }
        var type = "Used";
        if (data.type == "add") {
            type = "Received";
        } else if (data.type == "remove") {
            type = "Removed";
        }
        // ${type !== 'Used' ? `<div class="itemBox-meow-boxes-meow">${type === 'Received' ? '+' : '-'}${data.amount === undefined ? '1' : data.amount}</div>` : ``}
        var itemboxHTML = `<div class="itemBox-meow"><div class="hexagon"><img class="hexagon-img"src="${isUrl(data.item.image) ? `${data.item.image}` : `images/${data.item.image}`}" alt=${data.item.name} ></div><div class="itemBox-meow-info"><div class="itemBox-meow-name">${data.item.label}</div><div class="itemBox-meow-boxes"><div class="itemBox-meow-boxes-meow">${type}</div></div></div></div>`
        var $itembox = $(itemboxHTML);
        $(".itemboxes-container").prepend($itembox);
        $itembox.fadeIn(250);
        setTimeout(function () {
            $($itembox).animate({
                left: -30+'vh',
            },720)
            $.when($itembox.fadeOut(300)).done(function () {
            });
        }, 3000);
    };
    

    Inventory.RequiredItem = function (data) {
        if (requiredTimeout !== null) {
            clearTimeout(requiredTimeout);
        }
        if (data.toggle) {
            if (!requiredItemOpen) {
                $(".requiredItem-container").html("");
                $.each(data.items, function (index, item) {
                    var element = `<div class="item-slot requiredItem-box"><div class="item-slot-amount"><p>Required</p></div><div class="item-slot-img"><img src="${isUrl(item.image) ? item.image : 'images/' + item.image}" alt="${item.name}" /></div><div class="item-slot-label"><p>${item.label}</p></div></div>`;
                    $(".requiredItem-container").hide();
                    $(".requiredItem-container").append(element);
                    $(".requiredItem-container").fadeIn(100);
                });
                requiredItemOpen = true;
            }
        } else {
            $(".requiredItem-container").fadeOut(100);
            requiredTimeout = setTimeout(function () {
                $(".requiredItem-container").html("");
                requiredItemOpen = false;
            }, 100);
        }
    };

    window.onload = function (e) {
        window.addEventListener("message", function (event) {
            switch (event.data.action) {
                case "open":
                    Inventory.Open(event.data);
                    break;
                case "close":
                    Inventory.Close();
                    break;
                case "update":
                    Inventory.Update(event.data);
                    break;
                case "itemBox":
                    Inventory.itemBox(event.data);
                    break;
                case "requiredItem":
                    Inventory.RequiredItem(event.data);
                    break;
                case "toggleHotbar":
                    Inventory.ToggleHotbar(event.data);
                    break;
                case "RobMoney":
                    $(".inv-options-list").append('<div class="inv-option-item" id="rob-money">TAKE MONEY</div>');
                    $("#rob-money").data("TargetId", event.data.TargetId);
                    break;
            }
        });
    };
})();

$(document).on("click", "#rob-money", function (e) {
    e.preventDefault();
    var TargetId = $(this).data("TargetId");
    $.post(
        "https://qb-inventory/RobMoney",
        JSON.stringify({
            TargetId: TargetId,
        })
    );
    $("#rob-money").remove();
});



$(document).on("click", ".main-inventory-boxes", function (e) {
    e.preventDefault();
    let id = $(this).attr('id')
    if (UsingItemsFilter) {
        $('.main-inventory-boxes').removeClass('box-brighter-background');
        $('.item-slot').removeClass('item-blur');
        $('.item-slot').draggable({ disabled: false });
        UsingItemsFilter = false;
        return;
    }
    if (id === 'FilterWeapons') {
        if (!$(this).hasClass('box-brighter-background')) {
            $(this).addClass('box-brighter-background')
            $.each($('.player-inventory').find(".item-slot"), function (i, slot) {
                if ($(slot).data("item") !== undefined) {
                    if ($(slot).data("item").name.split("_")[0] !== "weapon"  && ($(slot).data("item").name.split("_")[0] !== "body") && ($(slot).data("item").name.split("_")[0] !== "bp" && ($(slot).data("item").name.split("_")[0] !== "mag")) && $(slot).data("item").name.slice($(slot).data("item").name.indexOf('_') + 1) !== 'ammo' ) {
                        $(slot).addClass('item-blur')
                        $(slot).draggable({ disabled: true });          
                    }
                } 
            });
        }
    }
    if (id === 'FilterFood') {
        if (!$(this).hasClass('box-brighter-background')) {
            $(this).addClass('box-brighter-background')
            $.each($('.player-inventory').find(".item-slot"), function (i, slot) {
                if ($(slot).data("item") !== undefined) {
                    if ($(slot).data("item").category !== "food") {
                        $(slot).addClass('item-blur')
                        $(slot).draggable({ disabled: true });          
                    }
                } 
            });
        }
    }
    if (id === 'FilterTools') {
        if (!$(this).hasClass('box-brighter-background')) {
            $(this).addClass('box-brighter-background')
            $.each($('.player-inventory').find(".item-slot"), function (i, slot) {
                if ($(slot).data("item") !== undefined) {
                    if ($(slot).data("item").category !== "tools") {
                        $(slot).addClass('item-blur')
                        $(slot).draggable({ disabled: true });          
                    }
                } 
            });
        }
    }
    if (id === 'FilterGeneral') {
        if (!$(this).hasClass('box-brighter-background')) {
            $(this).addClass('box-brighter-background')
            $.each($('.player-inventory').find(".item-slot"), function (i, slot) {
                if ($(slot).data("item") !== undefined) {
                    if ($(slot).data("item").category !== "general") {
                        $(slot).addClass('item-blur')
                        $(slot).draggable({ disabled: true });          
                    }
                } 
            });
        }
    }
    UsingItemsFilter = true;
});

$(".main-inventory-inputmeow").on("keyup", function() {
    var value = $(this).val().toLowerCase();    
    $($('.other-inventory').find(".item-slot")).filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });  
});

let lefty = 0
let topy = 0
$('body').mousemove(function (event) { 
    if ($('.item-shit').css('display') !== 'none') {return}
    topy = event.clientY
    lefty = event.clientX
    var howloooong = $('.ply-iteminfo-container').width();
    var howtaaaall = $('.ply-iteminfo-container').height()/2 > 70 ? $('.ply-iteminfo-container').height()/2 - 100 : $('.ply-iteminfo-container').height()/2 
    if (event.clientX < 1560) {
        datway = false
        $('.ply-iteminfo-container').css('left', (event.clientX+26)+'px').css('top', (event.clientY-howtaaaall)+'px')
    } else if (event.clientX >= 1560) {
        datway = true
        var howloooong = $('.ply-iteminfo-container').width();
        $('.ply-iteminfo-container').css('left', (event.clientX-howloooong-26)+'px').css('top', (event.clientY-howtaaaall)+'px')
    }
});
